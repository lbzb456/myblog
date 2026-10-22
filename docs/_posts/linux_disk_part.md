---
title: Linux 虚拟机硬盘扩展与挂载指南
date: 2026-08-25
categories:
  - 研发实战
tags:
  - Linux
  - 磁盘管理
  - 虚拟机
  - 运维
---
> 本文详细介绍在 VMware 虚拟机中扩展 Linux 硬盘容量、新建虚拟硬盘以及挂载使用的完整流程，包含 Gparted 分区、手动挂载、开机自动挂载等关键步骤。

## 一、增加磁盘空间

### 方法一：扩展原有磁盘容量

关机后在虚拟机设置中扩展磁盘容量。

![关机后扩展磁盘容量](/images/linux_disk_part/1787560815985.png)

本例将磁盘从 20G 扩展到 24G。

### 方法二：添加新虚拟硬盘

在虚拟机设置中添加一块新的虚拟硬盘。

![添加新硬盘](/images/linux_disk_part/1787560873392.png)

## 二、使用 Gparted 进行分区

启动虚拟机后，使用 Gparted 分区工具对新扩展的硬盘空间进行分区。

![Gparted 分区工具](/images/linux_disk_part/1787561058328.png)

- **sda**：扩展即可，在图形界面中可以看到扩展后的硬盘空间
- **sdb**：新建硬盘，需要先扩展分区表

![分区操作](/images/linux_disk_part/1787561129323.png)

## 三、sdb 手动挂载

### 1. 查看磁盘状态

```bash
sudo lsblk
```

输出示例：

```
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
loop0    7:0    0     4K  1 loop /snap/bare/5
loop1    7:1    0    74M  1 loop /snap/core22/2411
...
sda      8:0    0    24G  0 disk
├─sda1   8:1    0   512M  0 part /boot/efi
├─sda2   8:2    0     1K  0 part
└─sda5   8:5    0  23.5G  0 part /
sdb      8:16   0    20G  0 disk
└─sdb1   8:17   0    20G  0 part /
sr0     11:0    1   4.1G  0 rom
```

> ⚠️ **注意**：从 `lsblk` 输出看，`sdb1` 显示挂载点为 `/`，但实际并未真正挂载到根目录。需要先卸载并重新挂载到正确位置。

### 2. 确认磁盘详情

```bash
# 查看 sdb1 的真实文件系统类型
sudo blkid /dev/sdb1

# 查看当前挂载情况
df -h | grep sdb

# 查看分区详情
sudo fdisk -l /dev/sdb
```

### 3. 创建挂载点并挂载

```bash
# 创建挂载目录
sudo mkdir -p /mnt/sdb

# 手动挂载（以 ext4 为例，根据 blkid 结果调整类型）
sudo mount /dev/sdb1 /mnt/sdb

# 如果是其他文件系统，比如 xfs/ntfs
# sudo mount -t xfs /dev/sdb1 /mnt/sdb
# sudo mount -t ntfs /dev/sdb1 /mnt/sdb
```

### 4. 验证挂载结果

```bash
# 查看是否挂载成功
df -h | grep sdb

# 查看磁盘内容
ls -la /mnt/sdb
```

### 5. 实际执行结果

```bash
lu@lu-virtual-machine:~$ sudo blkid /dev/sdb1
/dev/sdb1: UUID="80e8ccfc-1dc5-4d68-8ad1-6f3cd442734c" TYPE="ext4" PARTUUID="2526ae80-84fd-4a01-9a8b-ac13585f9112"

lu@lu-virtual-machine:~$ sudo fdisk -l /dev/sdb
Disk /dev/sdb：20 GiB，21474836480 字节，41943040 个扇区
Disk model: VMware Virtual S
单元：扇区 / 1 * 512 = 512 字节
扇区大小(逻辑/物理)：512 字节 / 512 字节
I/O 大小(最小/最佳)：512 字节 / 512 字节
磁盘标签类型：gpt
磁盘标识符：C38A2B3C-DE83-43C3-8EBB-8CA387325A0E

设备        起点     末尾     扇区 大小 类型
/dev/sdb1   2048 41940991 41938944  20G Linux 文件系统

lu@lu-virtual-machine:~$ sudo mkdir -p /mnt/sdb
lu@lu-virtual-machine:~$ sudo mount /dev/sdb1 /mnt/sdb
lu@lu-virtual-machine:~$ df -h | grep sdb
/dev/sdb1        20G   24K   19G    1% /mnt/sdb
lu@lu-virtual-machine:~$ ls -la /mnt/sdb
总用量 24
drwxr-xr-x 3 root root  4096 8月  24 16:22 .
drwxr-xr-x 3 root root  4096 8月  24 16:33 ..
drwx------ 2 root root 16384 8月  24 16:22 lost+found
```

✅ **挂载成功，状态正常：**

- `sdb1` 是 20G 的 ext4 分区，已挂载到 `/mnt/sdb`
- 当前为空盘（只有 `lost+found`），可用空间约 19G

![挂载成功](/images/linux_disk_part/1787561352372.png)

## 四、设置开机自动挂载

### 1. 获取分区 UUID

```bash
sudo blkid /dev/sdb1
```

### 2. 编辑 fstab 文件

```bash
sudo nano /etc/fstab
```

在文件末尾添加一行（**根据实际文件系统类型修改**）：

```
UUID=80e8ccfc-1dc5-4d68-8ad1-6f3cd442734c  /mnt/sdb  ext4  defaults,noatime  0  2
```

### 3. 验证配置

```bash
sudo mount -a
echo $?
```

如果输出 `0`，说明配置正确，重启后 `/mnt/sdb` 会自动挂载。

### 4. 调整目录权限（可选）

当前 `/mnt/sdb` 归 `root` 所有，普通用户写入会权限不足。如果需要当前用户直接读写：

```bash
sudo chown -R $USER:$USER /mnt/sdb
```

之后就可以直接在 `/mnt/sdb` 下创建文件了。

## 五、常见问题与注意事项

| 情况                    | 处理                                                 |
| ----------------------- | ---------------------------------------------------- |
| `blkid` 无输出        | `sdb1` 未格式化，需先 `sudo mkfs.ext4 /dev/sdb1` |
| 提示`already mounted` | 先`sudo umount /dev/sdb1` 再重新挂载               |
| 挂载后权限不足          | `sudo chown -R $USER:$USER /mnt/sdb`               |

## 六、挂载到 /media 路径（图形界面显示）

### 问题描述

挂载到 `/mnt` 路径后，文件管理器中不显示该硬盘。

### 解决方案

挂载到 `/media` 即可正常使用图形界面操作硬盘。GNOME 文件管理器会自动显示 `/media` 下的设备，如果希望它像 U 盘一样出现在左侧边栏：

![文件管理器显示硬盘](/images/linux_disk_part/1787620782973.png)

两个硬盘都正常显示。

### 操作步骤

```bash
# 1. 创建 /media 下的挂载点
sudo mkdir -p /media/sdb

# 2. 卸载原位置
sudo umount /mnt/sdb

# 3. 重新挂载到新位置
sudo mount /dev/sdb1 /media/sdb

# 4. 修改 fstab（把原来的 /mnt/sdb 改成 /media/sdb）
sudo sed -i 's|/mnt/sdb|/media/sdb|g' /etc/fstab

# 5. 验证
sudo mount -a
```



访问权限问题

![](https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F8b5527b7ca776ad6cf9518a6ac1c0fbc973ea63fb63599c1d2bfab0d663c44d2?filename=image.png&sig=GOOOHUo0iGwVvRwnKI4pGux5EOmAxvDgVScVWGOTwEA=&t=p)

更改所有权

```
lu@lu-virtual-machine:/media/sdb$ lsblk
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
loop0    7:0    0     4K  1 loop /snap/bare/5
loop1    7:1    0 531.5M  1 loop /snap/gnome-42-2204/263
loop2    7:2    0 349.7M  1 loop /snap/gnome-3-38-2004/143
loop3    7:3    0    46M  1 loop /snap/snap-store/638
loop4    7:4    0  63.3M  1 loop /snap/core20/1828
loop5    7:5    0  49.9M  1 loop /snap/snapd/18357
loop6    7:6    0    74M  1 loop /snap/core22/2411
loop7    7:7    0  50.1M  1 loop /snap/snapd/27406
loop8    7:8    0  12.2M  1 loop /snap/snap-store/1216
loop9    7:9    0  91.7M  1 loop /snap/gtk-common-themes/1535
loop10   7:10   0 346.3M  1 loop /snap/gnome-3-38-2004/119
sda      8:0    0    24G  0 disk 
├─sda1   8:1    0   512M  0 part /boot/efi
├─sda2   8:2    0     1K  0 part 
└─sda5   8:5    0  23.5G  0 part /
sdb      8:16   0    20G  0 disk 
└─sdb1   8:17   0    20G  0 part /media/sdb
sr0     11:0    1   4.1G  0 rom  /media/lu/Ubuntu 20.04.6 LTS amd641
lu@lu-virtual-machine:/media/sdb$ df -h | grep sdb
/dev/sdb1        20G   24K   19G    1% /mnt/sdb
lu@lu-virtual-machine:/media/sdb$ sudo blkid /dev/sdb1
[sudo] lu 的密码： 
/dev/sdb1: UUID="80e8ccfc-1dc5-4d68-8ad1-6f3cd442734c" TYPE="ext4" PARTUUID="2526ae80-84fd-4a01-9a8b-ac13585f9112"
lu@lu-virtual-machine:/media/sdb$ sudo chown -R lu:lu /media/sdb
lu@lu-virtual-machine:/media/sdb$ chmod -R u+rwx /media/sdb
lu@lu-virtual-machine:/media/sdb$ 

```

## 七、总结

本文完整介绍了 Linux 虚拟机硬盘扩展的两种方法（扩展原磁盘 + 新增硬盘），并详细说明了使用 Gparted 分区、手动挂载、开机自动挂载以及图形界面显示的全流程。关键要点：

1. **扩展磁盘**：可在关机状态下扩展原有磁盘容量，或添加新虚拟硬盘
2. **分区工具**：使用 Gparted 进行图形化分区操作
3. **挂载位置**：`/mnt` 适合命令行使用，`/media` 适合图形界面
4. **自动挂载**：通过 `/etc/fstab` 配置 UUID 实现开机自动挂载
5. **权限管理**：使用 `chown` 命令调整目录权限

## 参考链接

- [Linux 磁盘分区与挂载详解](https://www.cnblogs.com/rusthx/articles/17854510.html)

---

## 评论

<GiscusComment />

```
lu@lu-virtual-machine:/media/sdb$ lsblk
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
loop0    7:0    0     4K  1 loop /snap/bare/5
loop1    7:1    0 531.5M  1 loop /snap/gnome-42-2204/263
loop2    7:2    0 349.7M  1 loop /snap/gnome-3-38-2004/143
loop3    7:3    0    46M  1 loop /snap/snap-store/638
loop4    7:4    0  63.3M  1 loop /snap/core20/1828
loop5    7:5    0  49.9M  1 loop /snap/snapd/18357
loop6    7:6    0    74M  1 loop /snap/core22/2411
loop7    7:7    0  50.1M  1 loop /snap/snapd/27406
loop8    7:8    0  12.2M  1 loop /snap/snap-store/1216
loop9    7:9    0  91.7M  1 loop /snap/gtk-common-themes/1535
loop10   7:10   0 346.3M  1 loop /snap/gnome-3-38-2004/119
sda      8:0    0    24G  0 disk 
├─sda1   8:1    0   512M  0 part /boot/efi
├─sda2   8:2    0     1K  0 part 
└─sda5   8:5    0  23.5G  0 part /
sdb      8:16   0    20G  0 disk 
└─sdb1   8:17   0    20G  0 part /media/sdb
sr0     11:0    1   4.1G  0 rom  /media/lu/Ubuntu 20.04.6 LTS amd641
lu@lu-virtual-machine:/media/sdb$ df -h | grep sdb
/dev/sdb1        20G   24K   19G    1% /mnt/sdb
```

---

*本文由 AI Agent 辅助创作*
