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
  for (let i = 0; i< figma.currentPage.selection.length; i++) {
    let nodes = figma.currentPage.selection
    await figma.clientStorage.setAsync("key", (nodes[i] as ComponentNode).key)
  }
  return true
}

// 保存したComponent IDを使ってリプレイス
async function replaceNodes() {
  const teamLibraryComponentKey = await figma.clientStorage.getAsync("key")
  const teamLibraryMasterComponent = await figma.importComponentByKeyAsync(teamLibraryComponentKey)
  const selections = figma.currentPage.selection
  for (let i = 0; i< selections.length; i++) {
    if (selections[i].type === "INSTANCE") {
      (selections[i]as InstanceNode).masterComponent = teamLibraryMasterComponent
    }
  }
}

main()
