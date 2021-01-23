async function main() {
  if (figma.command == "saveTargetComponent") {
    await saveTargetComponent()
  }
  else if (figma.command == "replaceNodes") {
    await replaceNodes()
  }
  figma.closePlugin()
}

// ComponentFileのComponent IDを取得して保存
async function saveTargetComponent() {
  return 1
}

// 保存したComponent IDを使ってリプレイス
async function replaceNodes() {
  return 1
}

main()
