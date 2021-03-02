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
  for (const node of nodes) {
    if (node.type === "COMPONENT") {
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
  for (const node of nodes) {
    if (node.type === "INSTANCE" || node.type === "FRAME" || node.type === "GROUP") {
      const key = teamLibraryComponents[node.name]    
      if (key != undefined) { 
        if (node.type === "INSTANCE" && node.mainComponent.key === teamLibraryComponents[node.name]) {
          continue
        } else {
          try {  
            const getTeamLibraryComponent = await figma.importComponentByKeyAsync(key)
            const teamLibrayComponentInstance = await getTeamLibraryComponent.createInstance()
            const index = node.parent.children.findIndex((child) => child.id === node.id)
            node.parent.insertChild(index, teamLibrayComponentInstance)
            teamLibrayComponentInstance.x = node.x
            teamLibrayComponentInstance.y = node.y
            node.remove()
          }
          catch(e) {
            figma.notify(e)
          } 
        }
      } else {
        replaceNodes(node.children, teamLibraryComponents)
      }
    } else if (nodes[i].children != null) {
      replaceNodes(nodes[i].children, teamLibraryComponents)
    } else if (nodes[i].children === null) {
      return false
    }
  }
}

main()
