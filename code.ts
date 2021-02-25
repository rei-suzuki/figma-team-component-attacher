const clientStrageKey = 'team-library-components'

async function main() {
  if (figma.command == "saveTargetComponent") {
    await saveTargetComponent([figma.currentPage])
  }
  else if (figma.command == "replaceNodes") {
    await replaceNodes(figma.currentPage.selection)
  }
  figma.closePlugin()
}

// ComponentFileのComponent IDを取得して保存
const teamLibraryMasterComponents = {}
async function saveTargetComponent(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].type === "COMPONENT" || nodes[i].type === "COMPONENTSET") {
      teamLibraryMasterComponents[nodes[i].name] = (nodes[i] as ComponentNode).key
    } 
    if (nodes[i].children != null) {
      saveTargetComponent(nodes[i].children)
    }
    if (nodes[i].children === null){
      return false
    }
  }
  
  await figma.clientStorage.setAsync(clientStrageKey, teamLibraryMasterComponents) 
}

// 保存したComponent IDを使ってリプレイス
async function replaceNodes(nodes) {
  const teamLibraryComponents = await figma.clientStorage.getAsync(clientStrageKey)

  for (let i = 0; i< nodes.length; i++) {
    if (nodes[i].type === "FRAME" || nodes[i].type === "INSTANCE") {
      const key = teamLibraryComponents[nodes[i].name]
      const getTeamLibraryComponent = await figma.importComponentByKeyAsync(key)
      const teamLibrayComponentInstance = await getTeamLibraryComponent.createInstance()
      nodes[i].parent.insertChild(1, teamLibrayComponentInstance)
      //indexの1はまだ適当に入れてるだけ
      teamLibrayComponentInstance.x = nodes[i].x
      teamLibrayComponentInstance.y = nodes[i].y
      nodes[i].remove()
    }
  }
}

main()
