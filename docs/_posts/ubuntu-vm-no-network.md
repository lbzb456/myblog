---
title: Ubuntu 20.04 虚拟机开机无网排查实录：从「未托管」到默认路由缺失
date: 2026-11-13
categories:
  - 研发实战
tags:
  - Linux
  - 虚拟机
  - 网络排查
  - 运维
  - Ubuntu
---
> 环境：Ubuntu 20.04.6 LTS / VMware 虚拟机 / NetworkManager 1.22.10 / 网卡 ens33
>
> 症状：每次开机后必须手动执行 `sudo ip link set ens33 up && sudo dhclient ens33` 才能联网

## 一、问题背景

虚拟机每次重启后都处于无网络状态，必须手动执行两条命令才能恢复：

```bash
sudo ip link set ens33 up
sudo dhclient ens33
```

这种「每次开机都要手动救一次」的问题，通常意味着**网络管理服务没有接管网卡**。但本次排查发现，实际上有两层相互独立的问题叠加在一起，只修第一层并不会真正解决。

## 二、第一层：ens33 处于「未托管」状态

### 2.1 现象确认

```bash
$ nmcli device status
DEVICE  TYPE      STATE   CONNECTION
ens33   ethernet  未托管  --
lo      loopback  未托管  --
```

`未托管`（unmanaged）表示 NetworkManager 明确不管这块网卡。此时开机自然不会去 `up` 它，也不会跑 DHCP。

### 2.2 定位根因

关键命令是 `nmcli networking`，它反映的是 NM 的**全局**网络开关，而非单块网卡：

```bash
$ nmcli networking
disabled
```

日志印证了这一点：

```
manager: Networking is disabled by state file
```

也就是说，NM 的全局网络被关闭了，且这个状态被写进了 state 文件，导致**每次开机都从文件里读出「禁用」**。全局禁用时，所有设备一律显示「未托管」。

同时确认了几件事，排除其他可能：

```bash
$ ls /etc/network/interfaces
没有那个文件或目录          # 没有 ifupdown 兜底配置

$ systemctl is-active systemd-networkd
inactive                    # networkd 未启用

$ cat /etc/netplan/01-network-manager-all.yaml
network:
  version: 2
  renderer: NetworkManager  # netplan 明确指定用 NM 渲染
```

三条路都指向 NM，但 NM 自己被关了，于是谁都不管网卡。

### 2.3 修复

```bash
# 清理一个历史上无效的残留配置（[device-ens33] 不是合法的 NM 配置段名，从未生效）
sudo rm -f /etc/NetworkManager/conf.d/99-ens33-managed.conf

# 打开全局网络（会写回 state 文件，开机不再禁用）
sudo nmcli networking on

sudo systemctl restart NetworkManager
sudo nmcli connection up "有线连接 1"

# 验证
nmcli networking        # enabled
nmcli device status     # ens33 已连接
```

此时 `nmcli networking` 变为 `enabled`，ens33 显示为「已连接」，也拿到了 IP，看起来问题已经解决。

## 三、第二层：有 IP、却上不了网

### 3.1 重启后问题复现

重启后检查，表面上一切正常：

```bash
$ nmcli networking && nmcli device status && ip -4 addr show ens33
enabled
DEVICE  TYPE      STATE   CONNECTION
ens33   ethernet  已连接  有线连接 1

inet 192.168.142.133/24 brd 192.168.142.255 scope global dynamic noprefixroute ens33
```

有 IP、有连接，但**实际打不开网页**，仍然需要手动 `sudo dhclient ens33` 才有网。

注意 `nmcli general status` 输出的细节：

```bash
$ nmcli general status
STATE             CONNECTIVITY
已连接（仅本地）  受限
```

`仅本地`（CONNECTED_LOCAL）这个状态是关键线索。

### 3.2 决定性证据：没有默认路由

```bash
$ ip route show default
                                  # 输出为空！

$ ping -c 2 223.5.5.5
ping: connect: 网络不可达
```

没有默认路由，自然无法访问任何外部地址。`dhclient` 之所以能「治好」它，正是因为 dhclient 会直接向内核写入默认路由和 DNS，**完全绕过 NetworkManager 的决策逻辑**。

### 3.3 从日志还原完整时间线

```
08:55:37  dhcp4 (ens33): option routers        => '192.168.142.2'
08:55:37  dhcp4 (ens33): state changed unknown -> bound
08:55:37  manager: NetworkManager state is now CONNECTED_LOCAL     ← 停在「仅本地」
          ...（12 分钟，无任何 default route）...
09:08:08  用户手动执行 dhclient ens33                              ← 手动干预
09:08:13  manager: NetworkManager state is now CONNECTED_SITE
09:08:13  policy: set '有线连接 1' (ens33) as default for IPv4 routing and DNS
```

DHCP 在 `08:55:37` 就已经**完全成功**了——IP、网关、DNS 全部拿到，状态是 `bound`。但 NM 随后只进入了 `CONNECTED_LOCAL`，**没有安装默认路由**，就这样空转了 12 分钟。

### 3.4 根因：卡住的连通性检查

NetworkManager 有一套状态机，只有达到 `CONNECTED_SITE` 或 `CONNECTED_GLOBAL` 时，才会把当前连接设为默认路由和 DNS 出口：

```
CONNECTED_LOCAL  → 仅本地可达，不安装默认路由
CONNECTED_SITE   → 可达本网络，安装默认路由
CONNECTED_GLOBAL → 可达公网
```

而这个状态由 NM 的 **connectivity check（连通性检查）** 决定，默认配置在：

```bash
$ cat /usr/lib/NetworkManager/conf.d/20-connectivity-ubuntu.conf
[connectivity]
uri=http://connectivity-check.ubuntu.com/
```

在国内网络环境下，这个检查会失败或长时间超时。NM 会按约 5 分钟的周期重试，往往要失败两轮以上才侥幸成功——这正好对应了那次 12 分钟的空窗期。

更微妙的是**鸡生蛋困境**：检查需要能访问外网，但 NM 在检查通过前不安装默认路由，于是本来就上不了外网。手动 `dhclient` 恰好打破了僵局：它塞进默认路由 → 网络瞬间可用 → 下一次检查随即成功 → NM 才补记一条 `set as default`。

**所以日志里 NM 的 `set as default` 是结果，不是原因。** 这一点在排查时极易误判。

## 四、最终修复

### 4.1 禁用连通性检查

既然检查逻辑在国内网络下不可靠，直接让它不做这个判断：

```bash
printf '[connectivity]\nenabled=false\n' \
  | sudo tee /etc/NetworkManager/conf.d/99-disable-connectivity-check.conf
```

确认写入正确：

```bash
$ cat /etc/NetworkManager/conf.d/99-disable-connectivity-check.conf
[connectivity]
enabled=false
```

这里有一个容易误判的点：用 `NetworkManager --print-config` 查看时，`uri=` 来自系统默认配置（`20-connectivity-ubuntu.conf`），`enabled=false` 来自我们新增的文件，两者合并显示属正常现象——关键是确认 `enabled=false` 确实已被加载生效，否则会误以为修好了其实配置根本没被读取。

```bash
NetworkManager --print-config | grep -A3 '\[connectivity\]'
```

### 4.2 排除干扰变量

这一步很关键。之前的排查一直被手动 `dhclient` 干扰，无法确认网络到底是谁恢复的：

```bash
sudo killall dhclient
sudo systemctl restart NetworkManager
```

### 4.3 验证（全程不做任何手动操作）

```bash
$ sleep 10; nmcli general status; ip route show default; ping -c 2 223.5.5.5
STATE   CONNECTIVITY  WIFI-HW  WIFI    WWAN-HW  WWAN
已连接  完全          已启用   已启用  已启用   已启用

default via 192.168.142.2 dev ens33

64 字节，来自 223.5.5.5: icmp_seq=1 ttl=128 时间=37.4 毫秒
64 字节，来自 223.5.5.5: icmp_seq=2 ttl=128 时间=44.1 毫秒
```

三项同时满足：`连接状态 = 已连接`、`CONNECTIVITY = 完全`、`默认路由存在`。

### 4.4 重启验收

```bash
sudo reboot
```

开机后等 10 秒，直接执行：

```bash
$ nmcli general status; ip route show default; ping -c 2 223.5.5.5
STATE   CONNECTIVITY  WIFI-HW  WIFI    WWAN-HW  WWAN
已连接  完全          已启用   已启用  已启用   已启用

default via 192.168.142.2 dev ens33 proto dhcp metric 100

rtt min/avg/max/mdev = 38.650/38.929/39.209/0.279 ms
```

重启后全程未执行 `ip link` 或 `dhclient`，`STATE = 已连接`、`CONNECTIVITY = 完全`、默认路由由 NM 以 `proto dhcp metric 100` 自动安装，ping 正常。

**无需任何手动操作，开机即可联网。** 问题彻底解决。

## 五、修复前后对比

| 检查项 | 修复前 | 修复后 |
|---|---|---|
| `nmcli networking` | disabled | enabled |
| `nmcli device status` | ens33 未托管 | ens33 已连接 |
| `nmcli general status` STATE | 已连接（仅本地） | 已连接 |
| CONNECTIVITY | 受限 | 完全 |
| `ip route show default` | 空 | `default via 192.168.142.2` |
| `ping 223.5.5.5` | 网络不可达 | 38ms 通 |
| 开机是否需手动干预 | 是 | 否 |

## 六、命令速查

```bash
# ---- 诊断 ----
nmcli networking                          # NM 全局网络开关
nmcli device status                       # 各网卡托管状态
nmcli general status                      # 全局状态 + 连通性
ip link show ens33                        # 链路层状态
ip -4 addr show ens33                     # IP 地址
ip route show default                     # 默认路由（重点）
resolvectl status ens33                   # DNS 配置来源
journalctl -u NetworkManager -b | grep -iE "default|dhcp4|CONNECTED"
cat /sys/class/net/ens33/carrier          # 网线/链路是否通（1=通）

# ---- 本次修复的两个动作 ----
sudo nmcli networking on                  # 第一层：打开全局网络
printf '[connectivity]\nenabled=false\n' \
  | sudo tee /etc/NetworkManager/conf.d/99-disable-connectivity-check.conf
                                          # 第二层：禁用连通性检查

# ---- 生效 ----
sudo systemctl restart NetworkManager

# ---- 备选方案（若 enabled=false 无效） ----
# 让 NM 改用 dhclient 作为 DHCP 后端，行为与手动 dhclient 一致
printf '[main]\ndhcp=dhclient\n' \
  | sudo tee /etc/NetworkManager/conf.d/99-dhcp-backend.conf
```

## 七、踩坑记录

### 1. 配置文件里的段名不是随便起的

`/etc/NetworkManager/conf.d/` 下曾经有人试图用这种写法让 NM 接管网卡：

```ini
[device-ens33]
match-device=interface-name:ens33
managed=1
```

`[device-ens33]` 并非合法的 NM 配置段名，NM 会静默忽略，**不报错也不生效**。合法写法只有 `[device]`、`[device-<类型>]`（如 `[device-wifi]`）这类固定形式。排查时如果发现某个配置「看起来合理但没作用」，务必用 `NetworkManager --print-config` 确认它是否真被加载：

```bash
NetworkManager --print-config | grep -A3 '\[connectivity\]'
```

本次修复过程中就出现过「以为配置写好了、实际文件根本没创建」的情况，靠这条命令才发现。

### 2. 别在手动 dhclient 还活着的时候下结论

手动 `dhclient` 会直接改路由表和 DNS，与 NetworkManager 争夺管理权。它活着的时候，观察到的任何「网络正常」都不能归因于 NM。**验证 NM 是否真修好，必须先 `killall dhclient`。**

同理，`killall dhclient` 不会清理它已安装的路由，会出现两条重复的默认路由：

```
default via 192.168.142.2 dev ens33                    ← dhclient 残留
default via 192.168.142.2 dev ens33 proto dhcp metric 100  ← NM 安装
```

网关相同、无害，重启后自然消失。

### 3. zsh 粘贴多行命令的坑

在 zsh 里粘贴含中文注释的多行命令时，形如 `# 2) 关键一步` 的行可能触发语法报错：

```
zsh: parse error near `)'
```

建议逐条执行命令，或去掉行内注释。

### 4. 「有线连接」的 DNS 不要硬编码

该连接曾把 DNS 硬编码为 `8.8.8.8`，而 VMware NAT 的 DHCP 服务器（192.168.142.254）下发的是 `192.168.142.2`（NAT 内置 DNS 转发器，解析国内域名更快更稳）。清空硬编码让它跟随 DHCP：

```bash
sudo nmcli connection modify "有线连接 1" ipv4.dns "" ipv4.ignore-auto-dns no
```

### 5. 遗留小隐患：IPv6 优先

```bash
$ getent hosts www.baidu.com
2408:873d:22:1a91:0:ff:b013:cf81 www.a.shifen.com www.baidu.com
```

只返回了 IPv6 地址，而这台虚拟机没有全局 IPv6 地址。某些程序若优先尝试 IPv6，会先超时几秒再回退到 IPv4，表现为「网络时快时慢」。如需强制 IPv4 优先，编辑 `/etc/gai.conf`，取消这一行的注释：

```
precedence ::ffff:0:0/96  100
```

## 八、小结

这次问题的价值在于**两层问题必须都修**：

1. **全局网络被禁用** → 表现为「未托管」，导致开机没人 up 网卡、没人跑 DHCP
2. **连通性检查卡住** → 表现为「有 IP、无默认路由」，导致看起来连上了却上不了网

如果只修第一层，症状会从「网卡是 UP 但没有 IP」变成「有 IP 但没有默认路由」，同样上不了网，很容易让人误以为第一步修复无效而放弃。

另外一条方法论上的教训：**排除干扰变量**。手动 `dhclient` 一直在场时，所有观察都被污染，直到把它 kill 掉、只留 NetworkManager 单独作业，才真正确认了根因。

## 评论

<GiscusComment />

---

*本文由 AI Agent 辅助创作*
