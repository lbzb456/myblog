---
title: Python 装饰器完全指南
date: 2026-05-04
categories:
  - 技术
tags:
  - Python
  - 装饰器
  - 设计模式
---

装饰器是 Python 中强大的功能之一，它可以修改函数或类的行为。本文将详细介绍装饰器的使用方法和实际应用场景。

## 什么是装饰器

装饰器是一个函数，它接收一个函数作为参数，并返回一个新的函数。

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("函数执行前")
        result = func(*args, **kwargs)
        print("函数执行后")
        return result
    return wrapper

@my_decorator
def say_hello(name):
    print(f"Hello, {name}!")
    return f"Hello, {name}!"
```

## 使用场景

### 1. 日志记录

```python
import logging

def log(func):
    def wrapper(*args, **kwargs):
        logging.info(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper
```

### 2. 性能计时

```python
import time

def timing(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper
```

## 总结

装饰器是 Python 中非常实用的功能，可以用于日志记录、性能计时、权限验证等。掌握装饰器可以让你的代码更加简洁和优雅。
