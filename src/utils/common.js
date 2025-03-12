export function countChineseCharacters(str) {
  let count = 0;
  // 遍历字符串中的每个字符
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    // 判断字符的 Unicode 编码是否在中文字符的范围内
    if (/[\u4e00-\u9fa5]/.test(char)) {
      count++;
    }
  }
  return count;
}
