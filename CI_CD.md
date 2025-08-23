# CI/CD Pipeline Documentation

Comprehensive continuous integration and continuous deployment setup for the Food Safety Reporting System.

## Overview

The project includes a complete CI/CD pipeline with automated testing, code quality checks, and deployment workflows using GitHub Actions.

## Workflows

### 1. Main CI/CD Pipeline (`test.yml`)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:

#### Code Quality Checks
- Runs Solhint (Solidity linter)
- Runs Prettier format checking
- Fails if code quality issues are found

#### Multi-Version Testing
Tests on three Node.js versions in parallel:
- **Node.js 18.x**: Compatibility testing
- **Node.js 20.x**: Primary version with coverage
- **Node.js 22.x**: Latest LTS support

#### Gas Reporting
- Generates gas usage reports for all contract functions
- Uploads reports as artifacts
- Helps track gas optimization over time

#### Security Checks
- Runs npm audit for dependency vulnerabilities
- Checks for moderate-level security issues
- Continues pipeline even if audit finds issues

#### Build Verification
- Ensures contracts compile successfully
- Verifies build artifacts are generated
- Checks contract sizes

### 2. Pull Request Checks (`pull-request.yml`)

**Triggers**:
- Pull request opened, synchronized, or reopened

**Features**:
- **PR Title Validation**: Enforces conventional commits format
  - Valid formats: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`, `perf:`
  - Example: `feat(contract): add new reporting feature`
- **Automated Comments**: Posts test results and coverage to PR
- **Security Scanning**: Checks for exposed secrets
- **Changes Summary**: Tracks which files were modified

### 3. Manual Testing (`manual.yml`)

**Trigger**: Manual dispatch from GitHub Actions UI

**Options**:
- Choose Node.js version (18.x, 20.x, or 22.x)
- Enable/disable coverage report
- Enable/disable gas report

**Use Cases**:
- Testing specific configurations
- Generating reports on demand
- Debugging CI issues

### 4. CodeQL Analysis (`codeql.yml`)

**Triggers**:
- Push to `main` or `develop`
- Pull requests
- Weekly schedule (Mondays at midnight)

**Features**:
- Automated security vulnerability detection
- Code quality analysis
- JavaScript/TypeScript scanning

## Code Quality Tools

### Solhint

Solidity linter configuration (`.solhint.json`):

```json
{
  "extends": "solhint:recommended",
  "rules": {
    "code-complexity": ["error", 10],
    "compiler-version": ["error", ">=0.8.4"],
    "func-visibility": ["error", { "ignoreConstructors": true }],
    "max-line-length": ["error", 120],
    "no-console": "off",
    "not-rely-on-time": "off"
  }
}
```

**Run Locally**:
```bash
npm run lint:sol          # Check Solidity files
npm run lint:fix          # Fix issues automatically
```

### Prettier

Code formatter configuration (`.prettierrc.yml`):

```yaml
printWidth: 120
tabWidth: 2
semi: true
singleQuote: false
trailingComma: "es5"

overrides:
  - files: "*.sol"
    options:
      tabWidth: 4
      printWidth: 120
```

**Run Locally**:
```bash
npm run prettier:check    # Check formatting
npm run prettier:write    # Fix formatting
npm run format            # Alias for prettier:write
```

### Combined Linting

```bash
npm run lint              # Run Solhint + Prettier check
```

## Code Coverage

### Codecov Integration

Configuration (`codecov.yml`):

```yaml
coverage:
  range: "70...100"
  status:
    project:
      target: 80%
      threshold: 5%
    patch:
      target: 75%
      threshold: 10%
```

**Targets**:
- **Project coverage**: 80% (±5% threshold)
- **Patch coverage**: 75% (±10% threshold)

**Run Locally**:
```bash
npm run test:coverage     # Generate coverage report
open coverage/index.html  # View in browser
```

### Coverage Reports

Generated files:
- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for tools
- `coverage/coverage-summary.json` - JSON summary

## Gas Reporting

Track gas costs for contract operations:

```bash
npm run test:gas          # Generate gas report
cat gas-report.txt        # View report
```

**CI Integration**:
- Automatically generated in CI pipeline
- Uploaded as workflow artifacts
- Available for download from GitHub Actions

## Setting Up CI/CD

### 1. GitHub Repository Setup

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

### 2. Configure Secrets

Add the following secrets in GitHub repository settings:

**Required**:
- `CODECOV_TOKEN` - Get from https://codecov.io

**Optional** (for deployment):
- `SEPOLIA_RPC_URL` - Alchemy/Infura RPC endpoint
- `PRIVATE_KEY` - Deployment wallet private key
- `ETHERSCAN_API_KEY` - For contract verification

**Steps**:
1. Go to repository Settings
2. Navigate to Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret

### 3. Enable Codecov

1. Visit https://codecov.io
2. Sign in with GitHub
3. Enable your repository
4. Copy the CODECOV_TOKEN
5. Add it to GitHub secrets

### 4. Branch Protection

Recommended settings for `main` branch:

- ✅ Require pull request reviews
- ✅ Require status checks to pass
  - `Code Quality Checks`
  - `Test on Node.js 18.x`
  - `Test on Node.js 20.x`
  - `Test on Node.js 22.x`
  - `Build Verification`
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Include administrators

## Workflow Status Badges

Add to README.md:

```markdown
![CI/CD](https://github.com/username/repo/workflows/CI/CD%20Pipeline/badge.svg)
![Coverage](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)
![CodeQL](https://github.com/username/repo/workflows/CodeQL/badge.svg)
```

## Local Development Workflow

### Before Committing

```bash
# 1. Run linters
npm run lint

# 2. Fix formatting issues
npm run format

# 3. Run tests
npm test

# 4. Check coverage
npm run test:coverage

# 5. Check gas costs (optional)
npm run test:gas
```

### Git Hooks (Optional)

Install Husky for pre-commit hooks:

```bash
npm install --save-dev husky lint-staged

# Setup
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.sol": ["solhint", "prettier --write"],
    "*.{js,json,md}": ["prettier --write"]
  }
}
```

## CI/CD Best Practices

### 1. Commit Messages

Follow conventional commits:

```
feat(contract): add emergency pause function
fix(deploy): correct network configuration
docs(readme): update installation instructions
test(workflow): add unit tests for reporting
chore(deps): update hardhat to v2.22.0
```

### 2. Pull Request Process

1. **Create feature branch**:
   ```bash
   git checkout -b feat/new-feature
   ```

2. **Make changes and test locally**:
   ```bash
   npm run lint
   npm test
   ```

3. **Commit with conventional format**:
   ```bash
   git commit -m "feat(feature): add new functionality"
   ```

4. **Push and create PR**:
   ```bash
   git push origin feat/new-feature
   ```

5. **Wait for CI checks** to pass

6. **Request review** from team members

7. **Merge** after approval

### 3. Reviewing PRs

Check list:
- ✅ CI/CD pipeline passes
- ✅ Code coverage maintained or improved
- ✅ Gas costs are reasonable
- ✅ No security vulnerabilities
- ✅ Documentation updated
- ✅ Tests added for new features

## Troubleshooting

### CI Failures

**Issue**: Tests fail in CI but pass locally

**Solutions**:
- Check Node.js version matches CI
- Ensure all dependencies are in `package.json`
- Clear local cache: `npm run clean && npm ci`

**Issue**: Linting fails in CI

**Solutions**:
- Run `npm run lint` locally first
- Fix issues with `npm run lint:fix`
- Check `.solhintignore` and `.prettierignore`

**Issue**: Coverage below threshold

**Solutions**:
- Add more tests for uncovered code
- Review coverage report: `open coverage/index.html`
- Update `codecov.yml` targets if needed

### Workflow Errors

**Issue**: Workflow doesn't trigger

**Solutions**:
- Check branch names match triggers
- Verify workflow file syntax
- Check GitHub Actions are enabled

**Issue**: Secrets not working

**Solutions**:
- Verify secret names match workflow
- Check secret values don't have extra spaces
- Ensure secrets are set at repository level

## Performance Optimization

### Faster CI Runs

1. **Use caching**:
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: "npm"
   ```

2. **Run jobs in parallel**:
   - Separate linting from testing
   - Test multiple Node versions concurrently

3. **Skip unnecessary steps**:
   ```yaml
   - name: Generate coverage
     if: matrix.node-version == '20.x'
     run: npm run test:coverage
   ```

### Reduce Build Times

- Use `npm ci` instead of `npm install`
- Cache compiled contracts
- Skip coverage for non-main branches (optional)

## Monitoring

### GitHub Actions Dashboard

View at: `https://github.com/username/repo/actions`

**Metrics to track**:
- Success rate of workflows
- Average run time
- Most common failures
- Resource usage

### Codecov Dashboard

View at: `https://codecov.io/gh/username/repo`

**Metrics to track**:
- Overall coverage trend
- Coverage by file
- Uncovered lines
- Coverage change per PR

## Advanced Configuration

### Matrix Testing

Test multiple configurations:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
    os: [ubuntu-latest, windows-latest]
```

### Conditional Workflows

```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

### Deployment Workflow

Add deployment step (example):

```yaml
deploy:
  name: Deploy to Sepolia
  runs-on: ubuntu-latest
  needs: [test-node-20]
  if: github.ref == 'refs/heads/main'

  steps:
    - name: Deploy contract
      env:
        PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
        SEPOLIA_RPC_URL: ${{ secrets.SEPOLIA_RPC_URL }}
      run: npm run deploy:sepolia
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Summary

This CI/CD pipeline provides:

- ✅ **Automated testing** on multiple Node.js versions
- ✅ **Code quality checks** with Solhint and Prettier
- ✅ **Coverage tracking** with Codecov integration
- ✅ **Security scanning** with npm audit and CodeQL
- ✅ **Gas reporting** for optimization
- ✅ **PR validation** with automated comments
- ✅ **Manual workflows** for custom testing
- ✅ **Build verification** for deployment readiness

The pipeline ensures high code quality, security, and reliability before any code reaches production.
