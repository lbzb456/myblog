# JavaScript 异步编程详解

异步编程是 JavaScript 中最重要的概念之一，理解它对于构建高效的 Web 应用至关重要。

## 为什么需要异步编程

JavaScript 是单线程语言，这意味着它一次只能执行一个任务。如果所有操作都是同步的，那么执行耗时的操作（如网络请求）会阻塞整个程序。

```javascript
// 同步代码会阻塞执行
function syncTask() {
  const data = fetchDataFromServer(); // 耗时操作
  console.log(data); // 等待上面完成才能执行
}
```

## 异步编程的几种方式

### 1. 回调函数

这是最早的异步处理方式：

```javascript
function fetchData(callback) {
  setTimeout(() => {
    const data = { name: 'John', age: 30 };
    callback(null, data);
  }, 1000);
}

fetchData((error, result) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Data:', result);
});
```

### 2. Promise

Promise 提供了更优雅的异步处理方式：

```javascript
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true;
      if (success) {
        resolve({ name: 'John', age: 30 });
      } else {
        reject(new Error('Failed to fetch data'));
      }
    }, 1000);
  });
}

fetchData()
  .then(data => console.log('Data:', data))
  .catch(error => console.error('Error:', error));
```

### 3. async/await

ES2017 引入的语法糖，让异步代码看起来像同步代码：

```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 使用
async function processData() {
  const result = await fetchData();
  console.log('Result:', result);
}
```

## 并行执行多个异步操作

使用 `Promise.all` 可以并行执行多个异步操作：

```javascript
async function fetchMultipleResources() {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(res => res.json()),
    fetch('/api/posts').then(res => res.json()),
    fetch('/api/comments').then(res => res.json())
  ]);
  
  return { user, posts, comments };
}
```

## 错误处理最佳实践

```javascript
async function safeOperation() {
  try {
    const result = await fetchData();
    return result;
  } catch (error) {
    // 优雅地处理错误
    console.error('Operation failed:', error.message);
    
    // 可以选择重试
    if (error.retryable) {
      return await safeOperation();
    }
    
    // 或者返回默认值
    return { default: true };
  }
}
```

## 总结

| 方法 | 优点 | 缺点 |
|------|------|------|
| 回调函数 | 简单直接 | 回调地狱 |
| Promise | 链式调用 | 仍需学习曲线 |
| async/await | 同步风格 | 需要理解 Promise |

选择合适的异步编程方式可以让您的代码更加清晰和可维护。