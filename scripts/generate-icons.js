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
const IOS_ASSETS_DIR = join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');

// 确保目标目录存在
if (!existsSync(TARGET_DIR)) {
  mkdirSync(TARGET_DIR, { recursive: true });
}
if (!existsSync(IOS_ASSETS_DIR)) {
  mkdirSync(IOS_ASSETS_DIR, { recursive: true });
}

// 需要生成的PNG图标尺寸
const SIZES = [
  32,
  128,
  256, // 用于生成 128x128@2x.png
];

// iOS平台所需的图标尺寸
const IOS_SIZES = [
  { size: 20, scales: [2, 3] },
  { size: 29, scales: [2, 3] },
  { size: 40, scales: [2, 3] },
  { size: 60, scales: [2, 3] },
  { size: 76, scales: [2] },
  { size: 83.5, scales: [2] },
  { size: 1024, scales: [1] }
];

// Windows平台所需的图标尺寸
const WINDOWS_SIZES = [
  { size: 30, name: 'Square30x30Logo' },
  { size: 44, name: 'Square44x44Logo' },
  { size: 71, name: 'Square71x71Logo' },
  { size: 89, name: 'Square89x89Logo' },
  { size: 107, name: 'Square107x107Logo' },
  { size: 142, name: 'Square142x142Logo' },
  { size: 150, name: 'Square150x150Logo' },
  { size: 284, name: 'Square284x284Logo' },
  { size: 310, name: 'Square310x310Logo' },
  { size: 50, name: 'StoreLogo' },
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

// 生成iOS平台图标
async function generateIosIcons() {
  // 生成Contents.json文件
  const contents = {
    images: [],
    info: {
      version: 1,
      author: 'xcode'
    }
  };

  for (const { size, scales } of IOS_SIZES) {
    for (const scale of scales) {
      const actualSize = Math.floor(size * scale);
      const fileName = `icon_${size}x${size}@${scale}x.png`;
      const filePath = join(IOS_ASSETS_DIR, fileName);
      
      await sharp(SOURCE_ICON)
        .resize(actualSize, actualSize)
        .png()
        .toFile(filePath);

      contents.images.push({
        size: `${size}x${size}`,
        idiom: size >= 76 ? 'ipad' : 'iphone',
        filename: fileName,
        scale: `${scale}x`
      });

      if (size === 1024) {
        contents.images.push({
          size: `${size}x${size}`,
          idiom: 'ios-marketing',
          filename: fileName,
          scale: '1x'
        });
      }

      console.log(`Generated iOS icon: ${fileName}`);
    }
  }

  // 写入Contents.json
  const contentsPath = join(IOS_ASSETS_DIR, 'Contents.json');
  const contentsJson = JSON.stringify(contents, null, 2);
  await import('fs/promises').then(fs => fs.writeFile(contentsPath, contentsJson));
  console.log('Generated Contents.json for iOS icons');
}

// 生成Windows平台图标
async function generateWindowsIcons() {
  for (const { size, name } of WINDOWS_SIZES) {
    const fileName = `${name}.png`;
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
    await generateWindowsIcons();
    await generateIcoIcon();
    await generateIcnsIcon();
    await generateIosIcons();
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();