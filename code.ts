const clientStrageKey = 'team-library-components'

async function main() {
  if (figma.command == "saveComponents") {
    const succeeded = await saveTeamLibraryComponentsToStorage(figma.currentPage)
    return figma.closePlugin(succeeded ? "👍Succeeded save components!" : "🤔This document does not have any components. 👀See plugin description for more informations.")
  }
  else if (figma.command == "replaceNodes") {
    const teamLibraryComponents = await figma.clientStorage.getAsync(clientStrageKey)
    await scanNodes(figma.currentPage.selection, teamLibraryComponents)
  }
  figma.closePlugin()
}

async function saveTeamLibraryComponentsToStorage(currentPage) {
  const masterComponent = await currentPage.findOne(n => n.type === "COMPONENT" || n.type === "COMPONENT_SET")
  if (masterComponent != null) {
    await figma.clientStorage.setAsync(clientStrageKey, await saveComponents([currentPage]))
    return true
  }
  return false
}

async function saveComponents(nodes) {
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
async function scanNodes(nodes, teamLibraryComponents) {
  for (const node of nodes) {
    if (node.type === "INSTANCE" || node.type === "FRAME" || node.type === "GROUP") {
      const key = teamLibraryComponents[node.name]
      if (key != undefined) { 
        if (node.type === "INSTANCE" && node.mainComponent.key === teamLibraryComponents[node.name]) {
          continue
        }
        await replaceNode(node, key)
      } else {
        scanNodes(node.children, teamLibraryComponents)
      }
    } 
  }
}

async function replaceNode(node, key) {
  try {  
    const teamLibraryComponent = await figma.importComponentByKeyAsync(key)
    const teamLibrayComponentInstance = await teamLibraryComponent.createInstance()
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
