const clientStrageKey = 'team-library-components'

async function main() {
  if (figma.command == "saveTargetComponent") {
    await figma.clientStorage.setAsync(clientStrageKey, await saveTargetComponent([figma.currentPage])) 
  }
  else if (figma.command == "replaceNodes") {
    const teamLibraryComponents = await figma.clientStorage.getAsync(clientStrageKey)    
    await replaceNodes(figma.currentPage.selection, teamLibraryComponents)
  }
  figma.closePlugin()
}

async function saveTargetComponent(nodes) {
  const teamLibraryMasterComponents = {}
  findComponent(teamLibraryMasterComponents, nodes)

  return teamLibraryMasterComponents
}

async function findComponent(teamLibraryMasterComponents, nodes) {
  const targetNode = []
  for (const node of nodes) {
    if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
      teamLibraryMasterComponents[node.name] = node.key
    } 
    if (node.children != null) {
      findComponent(teamLibraryMasterComponents, node.children)
    }
    if (node.children === null){
      return false
    }
  } 
}

// 保存したComponent IDを使ってリプレイス
async function replaceNodes(nodes, teamLibraryComponents) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].type === "INSTANCE" || nodes[i].type === "FRAME") {
      const key = teamLibraryComponents[nodes[i].name]
      if (key != undefined) {
        try {
          const getTeamLibraryComponent = await figma.importComponentByKeyAsync(key)
          const teamLibrayComponentInstance = await getTeamLibraryComponent.createInstance()
          const index = nodes[i].parent.children.findIndex((child) => child.id === nodes[i].id)
          nodes[i].parent.insertChild(index, teamLibrayComponentInstance)
          teamLibrayComponentInstance.x = nodes[i].x
          teamLibrayComponentInstance.y = nodes[i].y
          nodes[i].remove()
        }
        catch(e) {
          figma.notify(e)
        } 
      } else {
        replaceNodes(nodes[i].children, teamLibraryComponents)
      }
    } else if (nodes[i].children != null) {
      replaceNodes(nodes[i].children, teamLibraryComponents)
    } else if (nodes[i].children === null) {
      return false
    }
  }
}

main()
