#!/usr/bin/env npx tsx

/**
 * Code Analysis Tool for CoryApp
 * Analyzes the codebase to determine production readiness of features
 */

import * as fs from 'fs';
import * as path from 'path';

interface FeatureAnalysis {
  name: string;
  category: string;
  description: string;
  files: string[];
  productionReady: boolean;
  readinessScore: number;
  criteria: {
    codeComplete: boolean;
    errorHandling: boolean;
    typeScript: boolean;
    testing: boolean;
    documentation: boolean;
    security: boolean;
    performance: boolean;
    integration: boolean;
  };
  issues: string[];
  recommendations: string[];
}

interface CodeAnalysisResult {
  summary: {
    totalFeatures: number;
    productionReady: number;
    notReady: number;
    averageScore: number;
  };
  features: FeatureAnalysis[];
}

class CodeAnalyzer {
  private rootPath: string;
  private features: FeatureAnalysis[] = [];

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  async analyze(): Promise<CodeAnalysisResult> {
    console.log('🔍 Starting comprehensive code analysis...\n');

    // Define features to analyze
    const featureDefinitions = this.getFeatureDefinitions();

    // Analyze each feature
    for (const featureDef of featureDefinitions) {
      const analysis = await this.analyzeFeature(featureDef);
      this.features.push(analysis);
    }

    // Calculate summary
    const summary = this.calculateSummary();

    return {
      summary,
      features: this.features
    };
  }

  private getFeatureDefinitions() {
    return [
      {
        name: 'Authentication System',
        category: 'Core Infrastructure',
        description: 'User authentication, login, signup, and session management',
        patterns: [
          'src/lib/auth.tsx',
          'src/pages/LoginPage.tsx',
          'src/pages/SignupPage.tsx',
          'src/components/ProtectedRoute.tsx'
        ]
      },
      {
        name: 'Organization Management',
        category: 'Core Business Logic',
        description: 'Organization creation, settings, user roles, and team management',
        patterns: [
          'src/pages/OrganizationSettingsPage.tsx',
          'src/pages/SettingsPage.tsx',
          'supabase/migrations/*organization*'
        ]
      },
      {
        name: 'Campaign Builder',
        category: 'Core Business Logic',
        description: 'Campaign creation, editing, and management interface',
        patterns: [
          'src/pages/CampaignBuilderPage.tsx',
          'src/pages/CampaignDetailsPage.tsx',
          'src/pages/CampaignsListPage.tsx',
          'src/pages/CampaignsPage.tsx'
        ]
      },
      {
        name: 'Lead Management',
        category: 'Core Business Logic',
        description: 'Lead tracking, processing, and prospect management',
        patterns: [
          'src/components/workflows/admissions/*',
          'src/lib/api.ts',
          'supabase/migrations/*lead*'
        ]
      },
      {
        name: 'Dashboard & Analytics',
        category: 'User Interface',
        description: 'Main dashboard with metrics and analytics',
        patterns: [
          'src/pages/DashboardPage.tsx',
          'src/components/layout/*'
        ]
      },
      {
        name: 'External Integrations',
        category: 'External Services',
        description: 'Third-party integrations (Canvas, HubSpot, etc.)',
        patterns: [
          'src/components/integrations/*',
          'supabase/migrations/*integration*'
        ]
      },
      {
        name: 'Database Schema',
        category: 'Data Layer',
        description: 'Database structure, migrations, and RLS policies',
        patterns: [
          'supabase/migrations/*.sql',
          'src/lib/database.types.ts'
        ]
      },
      {
        name: 'API Layer',
        category: 'Data Layer',
        description: 'API functions for data access and manipulation',
        patterns: [
          'src/lib/api.ts',
          'src/lib/supabase.ts'
        ]
      },
      {
        name: 'Form Validation',
        category: 'Data Validation',
        description: 'Input validation and form handling',
        patterns: [
          'src/lib/validation.ts'
        ]
      },
      {
        name: 'UI Components',
        category: 'User Interface',
        description: 'Reusable UI components and design system',
        patterns: [
          'src/components/ui/*',
          'components/*'
        ]
      }
    ];
  }

  private async analyzeFeature(featureDef: any): Promise<FeatureAnalysis> {
    console.log(`📊 Analyzing: ${featureDef.name}`);

    const files = this.findFeatureFiles(featureDef.patterns);
    const criteria = await this.evaluateCriteria(files, featureDef);
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Calculate readiness score (0-100)
    const criteriaValues = Object.values(criteria);
    const readinessScore = Math.round((criteriaValues.filter(Boolean).length / criteriaValues.length) * 100);
    
    // Determine production readiness (requires 75% score)
    const productionReady = readinessScore >= 75;

    // Generate issues and recommendations
    this.generateIssuesAndRecommendations(criteria, featureDef.name, issues, recommendations);

    return {
      name: featureDef.name,
      category: featureDef.category,
      description: featureDef.description,
      files,
      productionReady,
      readinessScore,
      criteria,
      issues,
      recommendations
    };
  }

  private findFeatureFiles(patterns: string[]): string[] {
    const files: string[] = [];
    
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        // Handle glob patterns
        const dir = pattern.substring(0, pattern.indexOf('*'));
        const suffix = pattern.substring(pattern.indexOf('*') + 1);
        
        try {
          const fullDir = path.join(this.rootPath, dir);
          if (fs.existsSync(fullDir)) {
            const dirFiles = this.getFilesRecursively(fullDir);
            files.push(...dirFiles.filter(f => f.includes(suffix) || suffix === ''));
          }
        } catch (e) {
          // Directory doesn't exist, skip
        }
      } else {
        // Direct file path
        const fullPath = path.join(this.rootPath, pattern);
        if (fs.existsSync(fullPath)) {
          files.push(pattern);
        }
      }
    }
    
    return [...new Set(files)]; // Remove duplicates
  }

  private getFilesRecursively(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.rootPath, fullPath);
        
        if (entry.isDirectory()) {
          files.push(...this.getFilesRecursively(fullPath));
        } else if (entry.isFile()) {
          files.push(relativePath);
        }
      }
    } catch (e) {
      // Directory read error, skip
    }
    
    return files;
  }

  private async evaluateCriteria(files: string[], featureDef: any) {
    const criteria = {
      codeComplete: false,
      errorHandling: false,
      typeScript: false,
      testing: false,
      documentation: false,
      security: false,
      performance: false,
      integration: false
    };

    // Analyze files for each criterion
    for (const file of files) {
      const content = this.readFileContent(file);
      if (!content) continue;

      // Code completeness - check for TODOs, incomplete functions
      if (!criteria.codeComplete) {
        criteria.codeComplete = this.checkCodeCompleteness(content);
      }

      // Error handling - look for try-catch, error handling patterns
      if (!criteria.errorHandling) {
        criteria.errorHandling = this.checkErrorHandling(content);
      }

      // TypeScript - check for proper typing
      if (!criteria.typeScript) {
        criteria.typeScript = this.checkTypeScript(content, file);
      }

      // Testing - look for test files or test code
      if (!criteria.testing) {
        criteria.testing = this.checkTesting(file, content);
      }

      // Documentation - check for comments, JSDoc
      if (!criteria.documentation) {
        criteria.documentation = this.checkDocumentation(content);
      }

      // Security - check for security patterns
      if (!criteria.security) {
        criteria.security = this.checkSecurity(content);
      }

      // Performance - check for performance considerations
      if (!criteria.performance) {
        criteria.performance = this.checkPerformance(content);
      }

      // Integration - check for proper API integration
      if (!criteria.integration) {
        criteria.integration = this.checkIntegration(content);
      }
    }

    return criteria;
  }

  private readFileContent(file: string): string | null {
    try {
      const fullPath = path.join(this.rootPath, file);
      return fs.readFileSync(fullPath, 'utf8');
    } catch (e) {
      return null;
    }
  }

  private checkCodeCompleteness(content: string): boolean {
    // Check for incomplete code patterns
    const incompletePatterns = [
      /TODO/gi,
      /FIXME/gi,
      /XXX/gi,
      /HACK/gi,
      /\/\*\s*\.\.\.\s*\*\//g,
      /\/\*\.\.\.\*\//g,
      /function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g
    ];

    const hasIncompleteCode = incompletePatterns.some(pattern => pattern.test(content));
    
    // Check for substantial implementation
    const hasSubstantialCode = content.length > 200 && content.split('\n').length > 10;
    
    return !hasIncompleteCode && hasSubstantialCode;
  }

  private checkErrorHandling(content: string): boolean {
    const errorPatterns = [
      /try\s*{[\s\S]*?catch/g,
      /\.catch\(/g,
      /throw\s+new\s+Error/g,
      /if\s*\(\s*error\s*\)/g,
      /error\s*&&/g
    ];

    return errorPatterns.some(pattern => pattern.test(content));
  }

  private checkTypeScript(content: string, file: string): boolean {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) {
      return false;
    }

    // Check for TypeScript features
    const tsPatterns = [
      /:\s*\w+(\[\])?(\s*\|\s*\w+)*\s*[=;]/g, // Type annotations
      /interface\s+\w+/g,
      /type\s+\w+\s*=/g,
      /export\s+type/g,
      /import.*{.*}.*from/g
    ];

    const hasAnyType = /:\s*any\b/g.test(content);
    const hasTypeScript = tsPatterns.some(pattern => pattern.test(content));
    
    return hasTypeScript && !hasAnyType;
  }

  private checkTesting(file: string, content: string): boolean {
    const isTestFile = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file);
    const hasTestCode = /describe\(|it\(|test\(|expect\(/g.test(content);
    
    return isTestFile || hasTestCode;
  }

  private checkDocumentation(content: string): boolean {
    const docPatterns = [
      /\/\*\*[\s\S]*?\*\//g, // JSDoc comments
      /^\s*\/\/.*$/gm,        // Single line comments
      /^\s*\*.*$/gm           // Multi-line comment content
    ];

    const commentLines = content.match(/^\s*[\/\*].*/gm) || [];
    const codeLines = content.split('\n').filter(line => line.trim().length > 0);
    
    // At least 10% comments relative to code
    return commentLines.length / codeLines.length >= 0.1;
  }

  private checkSecurity(content: string): boolean {
    const securityPatterns = [
      /auth\./g,
      /authentication/gi,
      /authorization/gi,
      /permission/gi,
      /role/gi,
      /sanitize/gi,
      /validate/gi,
      /RLS|row level security/gi
    ];

    const hasSecurityPatterns = securityPatterns.some(pattern => pattern.test(content));
    
    // Check for potential security issues
    const securityIssues = [
      /eval\(/g,
      /innerHTML\s*=/g,
      /document\.write/g,
      /localStorage\.setItem.*password/gi
    ];

    const hasSecurityIssues = securityIssues.some(pattern => pattern.test(content));
    
    return hasSecurityPatterns && !hasSecurityIssues;
  }

  private checkPerformance(content: string): boolean {
    const performancePatterns = [
      /useMemo/g,
      /useCallback/g,
      /React\.memo/g,
      /lazy\(/g,
      /Suspense/g,
      /debounce/gi,
      /throttle/gi,
      /pagination/gi,
      /limit/gi
    ];

    return performancePatterns.some(pattern => pattern.test(content));
  }

  private checkIntegration(content: string): boolean {
    const integrationPatterns = [
      /supabase/gi,
      /api\./g,
      /fetch\(/g,
      /axios/gi,
      /async\s+function/g,
      /await/g,
      /\.then\(/g,
      /Promise/g
    ];

    return integrationPatterns.some(pattern => pattern.test(content));
  }

  private generateIssuesAndRecommendations(criteria: any, featureName: string, issues: string[], recommendations: string[]) {
    if (!criteria.codeComplete) {
      issues.push('Incomplete code implementation detected');
      recommendations.push('Complete TODOs and implement missing functionality');
    }

    if (!criteria.errorHandling) {
      issues.push('Insufficient error handling');
      recommendations.push('Add try-catch blocks and proper error handling');
    }

    if (!criteria.typeScript) {
      issues.push('Poor TypeScript implementation');
      recommendations.push('Add proper type annotations and remove any types');
    }

    if (!criteria.testing) {
      issues.push('No tests found');
      recommendations.push('Add unit tests and integration tests');
    }

    if (!criteria.documentation) {
      issues.push('Insufficient documentation');
      recommendations.push('Add JSDoc comments and inline documentation');
    }

    if (!criteria.security) {
      issues.push('Security concerns or patterns missing');
      recommendations.push('Implement proper authentication, authorization, and input validation');
    }

    if (!criteria.performance) {
      issues.push('No performance optimizations detected');
      recommendations.push('Add memoization, lazy loading, and optimize re-renders');
    }

    if (!criteria.integration) {
      issues.push('Poor API integration patterns');
      recommendations.push('Implement proper async patterns and error handling for API calls');
    }
  }

  private calculateSummary() {
    const totalFeatures = this.features.length;
    const productionReady = this.features.filter(f => f.productionReady).length;
    const notReady = totalFeatures - productionReady;
    const averageScore = Math.round(
      this.features.reduce((sum, f) => sum + f.readinessScore, 0) / totalFeatures
    );

    return {
      totalFeatures,
      productionReady,
      notReady,
      averageScore
    };
  }

  generateReport(result: CodeAnalysisResult): string {
    let report = '';
    
    // Header
    report += '# CoryApp Production Readiness Analysis\n\n';
    report += `**Analysis Date:** ${new Date().toLocaleDateString()}\n\n`;
    
    // Summary
    report += '## 📊 Summary\n\n';
    report += `| Metric | Value |\n`;
    report += `|--------|-------|\n`;
    report += `| Total Features | ${result.summary.totalFeatures} |\n`;
    report += `| Production Ready | ${result.summary.productionReady} |\n`;
    report += `| Not Ready | ${result.summary.notReady} |\n`;
    report += `| Average Score | ${result.summary.averageScore}% |\n\n`;

    // Features Table
    report += '## 🎯 Feature Analysis\n\n';
    report += '| Feature | Category | Status | Score | Issues | Files |\n';
    report += '|---------|----------|--------|-------|--------|---------|\n';

    for (const feature of result.features) {
      const status = feature.productionReady ? '✅ Ready' : '❌ Not Ready';
      const issueCount = feature.issues.length;
      const fileCount = feature.files.length;
      
      report += `| ${feature.name} | ${feature.category} | ${status} | ${feature.readinessScore}% | ${issueCount} | ${fileCount} |\n`;
    }

    // Detailed Analysis
    report += '\n## 🔍 Detailed Analysis\n\n';

    for (const feature of result.features) {
      report += `### ${feature.name}\n\n`;
      report += `**Description:** ${feature.description}\n\n`;
      report += `**Category:** ${feature.category}\n\n`;
      report += `**Production Ready:** ${feature.productionReady ? 'Yes' : 'No'}\n\n`;
      report += `**Overall Score:** ${feature.readinessScore}%\n\n`;

      // Criteria breakdown
      report += '**Criteria Evaluation:**\n\n';
      report += '| Criterion | Status |\n';
      report += '|-----------|--------|\n';
      report += `| Code Complete | ${feature.criteria.codeComplete ? '✅' : '❌'} |\n`;
      report += `| Error Handling | ${feature.criteria.errorHandling ? '✅' : '❌'} |\n`;
      report += `| TypeScript | ${feature.criteria.typeScript ? '✅' : '❌'} |\n`;
      report += `| Testing | ${feature.criteria.testing ? '✅' : '❌'} |\n`;
      report += `| Documentation | ${feature.criteria.documentation ? '✅' : '❌'} |\n`;
      report += `| Security | ${feature.criteria.security ? '✅' : '❌'} |\n`;
      report += `| Performance | ${feature.criteria.performance ? '✅' : '❌'} |\n`;
      report += `| Integration | ${feature.criteria.integration ? '✅' : '❌'} |\n\n`;

      // Issues
      if (feature.issues.length > 0) {
        report += '**Issues:**\n\n';
        for (const issue of feature.issues) {
          report += `- ${issue}\n`;
        }
        report += '\n';
      }

      // Recommendations
      if (feature.recommendations.length > 0) {
        report += '**Recommendations:**\n\n';
        for (const rec of feature.recommendations) {
          report += `- ${rec}\n`;
        }
        report += '\n';
      }

      // Files
      if (feature.files.length > 0) {
        report += '**Files Analyzed:**\n\n';
        for (const file of feature.files) {
          report += `- \`${file}\`\n`;
        }
        report += '\n';
      }

      report += '---\n\n';
    }

    return report;
  }
}

// Main execution
async function main() {
  const analyzer = new CodeAnalyzer(process.cwd());
  
  try {
    const result = await analyzer.analyze();
    const report = analyzer.generateReport(result);
    
    // Write report to file
    const reportPath = 'PRODUCTION_READINESS_REPORT.md';
    fs.writeFileSync(reportPath, report);
    
    console.log('\n🎉 Analysis complete!');
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log('\n📊 Quick Summary:');
    console.log(`   Features Analyzed: ${result.summary.totalFeatures}`);
    console.log(`   Production Ready: ${result.summary.productionReady}`);
    console.log(`   Not Ready: ${result.summary.notReady}`);
    console.log(`   Average Score: ${result.summary.averageScore}%`);
    
    // Also output the table to console
    console.log('\n🎯 Production Readiness Table:\n');
    console.log('Feature                 | Category           | Status      | Score | Issues');
    console.log('------------------------|--------------------|-----------  |-------|-------');
    
    for (const feature of result.features) {
      const name = feature.name.padEnd(22);
      const category = feature.category.padEnd(18);
      const status = (feature.productionReady ? '✅ Ready' : '❌ Not Ready').padEnd(11);
      const score = `${feature.readinessScore}%`.padEnd(5);
      const issues = feature.issues.length.toString();
      
      console.log(`${name} | ${category} | ${status} | ${score} | ${issues}`);
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { CodeAnalyzer };