import HanziWriter from "hanzi-writer";
import { loadResource } from "./resourceLoader";
/**
 * 创建汉字书写实例
 * @param {string} targetId - 目标DOM元素的ID
 * @param {string} char - 要显示的汉字
 * @param {Object} options - 配置选项
 * @param {number} options.width - 容器宽度
 * @param {number} options.height - 容器高度
 * @param {number} options.padding - 内边距
 * @param {boolean} options.showOutline - 是否显示轮廓
 * @param {number} options.strokeAnimationSpeed - 笔画动画速度
 * @param {number} options.delayBetweenStrokes - 笔画间延迟
 * @param {boolean} options.autoAnimate - 是否自动播放动画
 * @param {boolean} options.showCharacter - 是否显示汉字
 * @param {number} options.drawingWidth - 笔画宽度
 * @param {Function} options.onLoadCharDataSuccess - 字符数据加载成功回调
 * @param {Function} options.onComplete - 动画完成回调
 * @returns {HanziWriter} 返回HanziWriter实例
 */
export function createHanziWriter(targetId, char, options = {}) {
  const target = document.getElementById(targetId);
  if (!target) return null;

  target.innerHTML = "";

  const defaultOptions = {
    width: 300,
    height: 300,
    padding: 5,
    showOutline: true,
    strokeAnimationSpeed: 1,
    delayBetweenStrokes: 200,
    autoAnimate: false,
    showCharacter: false,
    drawingWidth: 3,
    charDataLoader: function (char, onComplete) {
      // 尝试从本地加载数据
      loadResource(`hanzi-writer/data/${char}.json`)
        .then(function (charData) {
          onComplete(charData);
        })
        .catch(() => {
          // 本地数据加载失败，从 CDN 加载
          HanziWriter.loadCharacterData(char).then(function (charData) {
            onComplete(charData);
          });
        });
    },
  };

  const writerOptions = { ...defaultOptions, ...options };
  return HanziWriter.create(targetId, char, writerOptions);
}
