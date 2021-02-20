const clientStrageKey = 'team-library-components'

async function main() {
  if (figma.command == "saveTargetComponent") {
    await saveTargetComponent()
  }
  else if (figma.command == "replaceNodes") {
    await replaceNodes(figma.currentPage.selection)
  }
    figma.closePlugin()
}

// ComponentFileのComponent IDを取得して保存
const teamLibraryMasterComponents= []
async function saveTargetComponent() {
  for (let i = 0; i< figma.currentPage.selection.length; i++) {
    let nodes = figma.currentPage.selection

    teamLibraryMasterComponents.push(new MasterComponent(nodes[i].name, (nodes[i] as ComponentNode).key))
    await figma.clientStorage.setAsync(clientStrageKey, teamLibraryMasterComponents)
    }
    
  return true
}

// 保存したComponent IDを使ってリプレイス
async function replaceNodes(nodes) {
  const teamLibraryComponents = await figma.clientStorage.getAsync(clientStrageKey)

  for (let i = 0; i< nodes.length; i++) {
    if(nodes[i].type === "FRAME" || nodes[i].type === "INSTANCE") {
      const findComponentName = teamLibraryComponents.find((v) => v.name === nodes[i].name)
      const getTeamLibraryComponent = await figma.importComponentByKeyAsync(findComponentName.key)
      const teamLibrayComponentInstance = getTeamLibraryComponent.createInstance()
      nodes[i].parent.insertChild(1, teamLibrayComponentInstance)
      //indexの1はまだ適当に入れてるだけ
      nodes[i].remove()
    }
  }
}

class MasterComponent {
  name: string
  key: string

  constructor(name: string, key: string) {
    this.name = name
    this.key  = key
  }
}


main()
