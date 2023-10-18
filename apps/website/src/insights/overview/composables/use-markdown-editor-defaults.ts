import { type Ref, ref } from 'vue'

export interface UseMarkdownEditorDefaults {
  readme: Ref<string>
  keyResult: Ref<string>
  resources: Ref<string>
}

export const useMarkdownEditorDefaults = (): UseMarkdownEditorDefaults => {
  const readme = ref(`#### Background

The project is a collaboration between \\<Project stakeholder\\> and \\<Project Stakeholder\\> to \\<project purpose\\> \\(e\\.g\\. the 1\\-line summary\\) This project will occur over \\<period of time\\>\\, from \\<approximate project start date\\> to \\<approximate project end date\\>

#### Key Research Questions

Please state the key research questions for this project\\. \\(e\\.g\\. What is the species richness in the study area\\?\\)

1. \\<Key research question 1\\>

2. \\<Key research question 2\\>

3. \\<Key research question 3\\>`)

  const keyResult = ref(`#### High-level Findings

E.g. We found that restoration sites had similar species richness to protected primary forest, which was also much higher than farmlands.

1. \\<Key result 1\\>
2. \\<Key result 2\\>
3. \\<Key result 3\\>

#### Impact

What are the main impacts of this project? 

E.g. Restoration sites in the Atlantic Forest can maintain biodiversity levels similar to those of protected primary forests.

E.g., We trained 10 members of the local community in ecoacoustic methods to facilitate capacity-building and long-term data collection.

1. \\<Key impact 1\\>
2. \\<Key impact 2\\>
3. \\<Key impact 3\\>`)

  const resources = ref(`Please provide any additional links for other resources related to this project (e.g., links to reports and webpages about the organizations, funders, labs, and other stakeholders). Make sure to delete the sample text and replace it with your own.

\\<Link 1\\>
Link description.

\\<Link 2\\>
Link description.`)

  return {
    readme,
    keyResult,
    resources
  }
}
