import { UserEvents } from "../defines"

const ResearchController = {
  hasResearchComponent: true,

  setupResearch()
  {
    this.events.on(UserEvents.SELECT_RESEARCH_TECHNOLOGY, this.onSelectResearchTechnology, this)
  },

  onSelectResearchTechnology(technology)
  {
    this.store.sectors[this.activeSector].beginResearch(technology)
  }
}

export default ResearchController