# GitHub Packages

This repository publishes npm packages to GitHub Packages.

## Published Packages

### @contactmatthew/matthewwrite-server
**Backend server package** - Express.js API with MySQL for typing speed test application

**Install:**
```bash
npm install @contactmatthew/matthewwrite-server
```

**Usage:**
```javascript
const server = require('@contactmatthew/matthewwrite-server');
// Or use the server directly from the package
```

**Version:** 1.0.0

---

### @contactmatthew/matthewwrite-client
**Frontend client package** - React application for typing speed testing

**Install:**
```bash
npm install @contactmatthew/matthewwrite-client
```

**Usage:**
```javascript
import { TypingTest } from '@contactmatthew/matthewwrite-client';
```

**Version:** 1.0.0

---

## Installing Packages

### Using npm

1. **Create a Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate a new token with `read:packages` and `write:packages` permissions
   - Copy the token

2. **Configure npm:**
   ```bash
   npm login --scope=@contactmatthew --registry=https://npm.pkg.github.com
   ```
   - Username: Your GitHub username
   - Password: Your Personal Access Token
   - Email: Your GitHub email

3. **Create `.npmrc` file:**
   ```bash
   @contactmatthew:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```

4. **Install packages:**
   ```bash
   npm install @contactmatthew/matthewwrite-server
   npm install @contactmatthew/matthewwrite-client
   ```

### Using yarn

1. **Configure yarn:**
   ```bash
   yarn config set @contactmatthew:registry https://npm.pkg.github.com
   ```

2. **Add to `.yarnrc.yml`:**
   ```yaml
   npmScopes:
     contactmatthew:
       npmRegistryServer: "https://npm.pkg.github.com"
   ```

3. **Install:**
   ```bash
   yarn add @contactmatthew/matthewwrite-server
   ```

## Publishing New Versions

Packages are automatically published when:
- A new GitHub release is created
- The workflow is manually triggered

### Manual Publishing

1. **Update version in package.json:**
   ```json
   "version": "1.1.0"
   ```

2. **Create a new release:**
   ```bash
   git tag -a v1.1.0 -m "Release 1.1.0"
   git push origin v1.1.0
   ```

3. **Or trigger workflow manually:**
   - Go to Actions tab
   - Select "Publish Packages to GitHub Packages"
   - Click "Run workflow"

## Package Scope

All packages are published under the `@contactmatthew` scope:
- `@contactmatthew/matthewwrite-server`
- `@contactmatthew/matthewwrite-client`

## Viewing Packages

Visit: https://github.com/contactmatthew/MatthewWrite/packages

## Authentication

For CI/CD or automated installations, use:
- **GITHUB_TOKEN** (automatically available in GitHub Actions)
- **Personal Access Token** (for local development)

## Support

For issues or questions about the packages, please open an issue on the repository.

