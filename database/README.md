# Database Setup

## Initial Setup

1. Run the main schema:
   ```bash
   mysql -u root -p < schema.sql
   ```

2. If you have an existing database, run the migration:
   ```bash
   mysql -u root -p < migration_add_role.sql
   ```

## Insert Sample Accounts

To create sample accounts (superadmin and user), run:

```bash
cd server
npm run setup-accounts
```

Or directly:
```bash
cd server
node insert_sample_accounts.js
```

### Sample Account Credentials

**Superadmin:**
- Username: `superadmin`
- Password: `superadmin123`

**User:**
- Username: `user`
- Password: `user123`

**Note:** Make sure to change these passwords in production!

## Manual Account Creation

You can also create accounts through the registration form in the application. To make a user a superadmin, run:

```sql
UPDATE users SET role = 'superadmin' WHERE username = 'your_username';
```
