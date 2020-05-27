# 每周总结可以写在这里
## delete究竟是在删什么？

### delete 0 输出什么？

答案： true
delete是在javascript1.2引入的，由于没有结构化的异常处理机制，比如try...catch，导致异常处理的结果是返回true，为什么返回true？因为delete操作不可能删除系统中的0，[],{}等常量，所以用true代替报错，delete删除的是一个表达式的结果。

### delete x 输出什么？

答案: true
无论x是否存在，都会返回true，delete x等价于 delete window.x，跟第一题不同的是，这里删除的是一个变量，也称之为删除一个成员，这里的x其实就是GetValue(x)，得到的是一个表达式的结果。

### delete obj.x，如果想x只是可读，输出什么？

答案：非严格模式：false ,严格模式： Cannot delete property 'a' of #< Object >
在非严格模式下，由于writable属性为false，不能删除，使用Object.freeze去试一下。
在严格模式下，不能去删除或修改可读属性，否则直接报错；