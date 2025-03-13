import sharp from 'sharp';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 源图标路径
const SOURCE_ICON = join(__dirname, '../public/icon.png');

// 目标图标目录
const TARGET_DIR = join(__dirname, '../src-tauri/icons');

// 确保目标目录存在
if (!existsSync(TARGET_DIR)) {
  mkdirSync(TARGET_DIR, { recursive: true });
}

// 需要生成的PNG图标尺寸
const SIZES = [
  32,
  128,
  256, // 用于生成 128x128@2x.png
];

// 生成PNG图标
async function generatePngIcons() {
  for (const size of SIZES) {
    const fileName = size === 256 ? '128x128@2x.png' : `${size}x${size}.png`;
    await sharp(SOURCE_ICON)
      .resize(size, size)
      .png()
      .toFile(join(TARGET_DIR, fileName));
    console.log(`Generated ${fileName}`);
  }
}

// 生成ICO图标
async function generateIcoIcon() {
  // 使用32x32和128x128尺寸生成ICO文件
  await sharp(SOURCE_ICON)
    .resize(128, 128)
    .toFile(join(TARGET_DIR, 'icon.ico'));
  console.log('Generated icon.ico');
}

// 生成ICNS图标 (仅在macOS上)
async function generateIcnsIcon() {
  if (process.platform === 'darwin') {
    const tempIconSet = 'icon.iconset';
    mkdirSync(join(TARGET_DIR, tempIconSet), { recursive: true });

    // 生成不同尺寸的图标
    const icnsSizes = [16, 32, 64, 128, 256, 512, 1024];
    for (const size of icnsSizes) {
      await sharp(SOURCE_ICON)
        .resize(size, size)
        .toFile(join(TARGET_DIR, tempIconSet, `icon_${size}x${size}.png`));
      if (size <= 512) {
        await sharp(SOURCE_ICON)
          .resize(size * 2, size * 2)
          .toFile(join(TARGET_DIR, tempIconSet, `icon_${size}x${size}@2x.png`));
      }
    }

    // 使用iconutil将图标集转换为icns文件
    execSync(`iconutil -c icns -o "${join(TARGET_DIR, 'icon.icns')}" "${join(TARGET_DIR, tempIconSet)}"`);
    // 删除临时图标集
    execSync(`rm -rf "${join(TARGET_DIR, tempIconSet)}"`);
    console.log('Generated icon.icns');
  }
}

// 主函数
async function main() {
  try {
    await generatePngIcons();
    await generateIcoIcon();
    await generateIcnsIcon();
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();