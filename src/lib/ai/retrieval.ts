import { BrandGuideline, ApprovedFact, TerminologyRule, GuidelineCategory } from '@/types';
import { repository } from '@/lib/storage/repository';

export interface RetrievedContext {
  relevantGuidelines: BrandGuideline[];
  relevantTerminology: TerminologyRule[];
  relevantFacts: ApprovedFact[];
}

export function retrieveRelevantGuidelines(
  content: string,
  categories: GuidelineCategory[]
): RetrievedContext {
  const contentLower = content.toLowerCase();
  const allGuidelines = repository.listGuidelines({ activeOnly: true });
  const allTerminology = repository.listTerminologyRules();
  const allFacts = repository.listApprovedFacts();

  // 1. Filter guidelines by selected categories and keyword relevance
  const relevantGuidelines = allGuidelines.filter((g) => {
    // If category is selected, consider it relevant
    if (categories.includes(g.category)) {
      // Check if any rule keywords appear in content
      const keywords = (g.title + ' ' + g.rule).toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const hasKeyword = keywords.some((kw) => contentLower.includes(kw));
      return hasKeyword || categories.length <= 3; // include all if focused categories
    }
    return false;
  });

  // 2. Terminology: check if any prohibited or preferred terms appear in the text
  const relevantTerminology = allTerminology.filter((rule) => {
    const prohibitedMatch = rule.prohibitedTerms.some((term) =>
      new RegExp(`\\b${term}\\b`, 'i').test(content)
    );
    const preferredMatch = new RegExp(`\\b${rule.preferredTerm}\\b`, 'i').test(content);
    return prohibitedMatch || preferredMatch;
  });

  // 3. Approved Facts: check for keyword overlap (uptime, SLA, founded, customers, etc.)
  const relevantFacts = allFacts.filter((fact) => {
    return fact.tags.some((tag) => contentLower.includes(tag.toLowerCase()));
  });

  return {
    relevantGuidelines,
    relevantTerminology,
    relevantFacts,
  };
}
