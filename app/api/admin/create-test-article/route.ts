import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // Create a test article directly in the database
    const article = await prisma.nfArticle.create({
      data: {
        title: 'Breaking: Government Announces New Digital Infrastructure Initiative',
        slug: 'government-digital-infrastructure-initiative',
        content: `# Breaking: Government Announces New Digital Infrastructure Initiative

## Overview
The Government of India has announced a comprehensive digital infrastructure initiative aimed at strengthening the nation's technological backbone and digital economy.

## Key Highlights

| Aspect | Details |
|--------|---------|
| Budget Allocation | ₹50,000 Crore |
| Timeline | 5 Years |
| Focus Areas | 5G, Data Centers, Cybersecurity |
| Expected Jobs | 500,000+ |

## Main Objectives

The initiative focuses on five critical areas:

1. **5G Network Expansion** - Accelerating 5G rollout across rural and urban areas
2. **Data Center Development** - Building world-class data centers across regions
3. **Cybersecurity Framework** - Strengthening national cybersecurity infrastructure
4. **Digital Literacy** - Training 10 million citizens in digital skills
5. **Startup Ecosystem** - Supporting 1,000 tech startups

## Implementation Strategy

The government will work with private sector partners to implement this initiative. Key milestones include:

- Q1 2024: Infrastructure planning and site identification
- Q2 2024: Tender process and vendor selection
- Q3 2024: Construction and deployment begins
- Q4 2024: First phase completion

## Expected Impact

- **Economic Growth**: 2-3% GDP contribution
- **Employment**: 500,000+ new jobs
- **Digital Access**: 95% population coverage
- **Innovation**: 1,000+ new tech startups

## Expert Opinion

Industry experts have welcomed the initiative, calling it a "game-changer for India's digital economy." The move is expected to position India as a global technology leader.

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Planning | 3 months | In Progress |
| Tender | 2 months | Upcoming |
| Deployment | 18 months | Upcoming |
| Completion | 24 months | Planned |

## Key Takeaways

- Government commits ₹50,000 Crore to digital infrastructure
- Initiative will create 500,000+ jobs
- 5G, data centers, and cybersecurity are priority areas
- Implementation to begin in Q1 2024
- Expected to boost GDP by 2-3%

---

*This article was created through the NewsFlash AI pipeline and reviewed by our editorial team.*`,
        excerpt: 'The Government of India has announced a comprehensive digital infrastructure initiative with ₹50,000 Crore budget allocation.',
        metaTitle: 'Government Digital Infrastructure Initiative - NewsFlash',
        metaDescription: 'Breaking news: Government announces ₹50,000 Crore digital infrastructure initiative focusing on 5G, data centers, and cybersecurity.',
        category: 'Government',
        tags: ['Government', 'Digital Infrastructure', 'Technology', 'India', 'Breaking News'],
        sourceUrl: 'https://example.com/government-initiative',
        sourceName: 'Government Press Release',
        region: 'India',
        priority: 'BREAKING',
        pipelineStatus: 'APPROVED',
        contentOrigin: 'AI_GENERATED',
        editorialGrade: 'A',
        overallScore: 0.95,
        isBreaking: true,
        aiDisclosure: 'This article was researched and drafted with AI assistance and reviewed by our editorial team.'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Test article created successfully',
      articleId: article.id,
      article
    })
  } catch (error: any) {
    console.error('Error creating test article:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
