const clientStrageKey = 'team-library-components'

async function main() {
  if (figma.command == "saveComponent") {
    await figma.clientStorage.setAsync(clientStrageKey, await saveComponent([figma.currentPage])) 
  }
  else if (figma.command == "replaceNodes") {
    const teamLibraryComponents = await figma.clientStorage.getAsync(clientStrageKey)    
    await findTargetNodes(figma.currentPage.selection, teamLibraryComponents)
  }
  figma.closePlugin()
}

async function saveComponent(nodes) {
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
  } 
}

// 保存したComponent IDを使ってリプレイス
async function findTargetNodes(nodes, teamLibraryComponents) {
  for (const node of nodes) {
    if (node.type === "INSTANCE" || node.type === "FRAME" || node.type === "GROUP") {
      const key = teamLibraryComponents[node.name]
      if (key != undefined) { 
        if (node.type === "INSTANCE" && node.mainComponent.key === teamLibraryComponents[node.name]) {
          continue
        }
        await replaceNodes(node, key)
      } else {
        findTargetNodes(node.children, teamLibraryComponents)
      }
    } 
  }
}

async function replaceNodes(node, key) {
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
    const error = e.toString()
    figma.notify(error)
  } 
}

main()
