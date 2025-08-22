import wiki from 'wikipedia';
import { WikiSearchRequest, WikiSearchResponse, WikiResult } from '../types';

class WikipediaService {
  constructor() {
    // Set default options for Wikipedia
    wiki.setLang('en');
  }

  async searchWikipedia(request: WikiSearchRequest): Promise<WikiSearchResponse> {
    try {
      const searchResults = await wiki.search(request.query, { 
        limit: request.limit || 10,
        suggestion: true 
      });

      const results: WikiResult[] = [];

      // If detailed results are requested, get summaries for each result
      if (request.detailed && searchResults.results.length > 0) {
        const detailedPromises = searchResults.results
          .slice(0, Math.min(5, searchResults.results.length)) // Limit to 5 detailed results
          .map(async (result) => {
            try {
              const summary = await this.getPageSummary(result.title);
              return {
                title: result.title,
                summary: summary.summary,
                url: summary.url,
                page_id: result.pageid?.toString()
              };
            } catch (error) {
              console.warn(`Failed to get summary for ${result.title}:`, error);
              return {
                title: result.title,
                summary: 'Summary not available',
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
                page_id: result.pageid?.toString()
              };
            }
          });

        const detailedResults = await Promise.all(detailedPromises);
        results.push(...detailedResults);
      } else {
        // Simple results without detailed summaries
        results.push(...searchResults.results.map(result => ({
          title: result.title,
          summary: result.snippet || 'No summary available',
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
          page_id: result.pageid?.toString()
        })));
      }

      return {
        results,
        query: request.query,
        total_results: searchResults.results.length
      };
    } catch (error) {
      console.error('Error searching Wikipedia:', error);
      throw new Error(`Wikipedia search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPageSummary(title: string): Promise<{ summary: string; url: string }> {
    try {
      const page = await wiki.page(title);
      const summary = await page.summary();
      
      return {
        summary: summary.extract,
        url: page.fullurl
      };
    } catch (error) {
      console.error(`Error getting page summary for ${title}:`, error);
      throw new Error(`Failed to get page summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPageContent(title: string, sections?: string[]): Promise<string> {
    try {
      const page = await wiki.page(title);
      
      if (sections && sections.length > 0) {
        // Get specific sections
        let content = '';
        for (const section of sections) {
          try {
            const sectionContent = await page.content();
            content += `\n\n${section}:\n${sectionContent}`;
          } catch (error) {
            console.warn(`Failed to get section ${section}:`, error);
          }
        }
        return content;
      } else {
        // Get full content
        return await page.content();
      }
    } catch (error) {
      console.error(`Error getting page content for ${title}:`, error);
      throw new Error(`Failed to get page content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRandomArticle(): Promise<WikiResult> {
    try {
      const randomTitle = await wiki.random();
      const summary = await this.getPageSummary(randomTitle);
      
      return {
        title: randomTitle,
        summary: summary.summary,
        url: summary.url
      };
    } catch (error) {
      console.error('Error getting random article:', error);
      throw new Error(`Failed to get random article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new WikipediaService();