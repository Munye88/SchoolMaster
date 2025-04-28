# Password Reset Guide for GOVCIO-SAMS ELT PROGRAM

## For Users

If you've forgotten your password, please follow these steps:

1. Click on the "Forgot Password?" link on the login page
2. You will see an alert with instructions to contact the administrator
3. Email the administrator at munyesufi1988@gmail.com with:
   - Your username
   - Your request for a password reset
   - Any verification information that might be required

## For Administrators

To reset a user's password, follow these steps:

1. Access the server where the application is deployed
2. Run the password reset script with the following command:

```bash
# Format:
tsx update-password.ts <username> <new_password>

# Example:
tsx update-password.ts Moon2025 NewSecurePassword123!
```

3. The script will confirm if the password was successfully updated
4. If the username is not found, the script will display all available usernames

### Script Features

- If run without arguments, the script will use default values and display usage instructions
- The script automatically hashes the password using secure cryptographic functions
- After execution, a confirmation message will be displayed

## Security Notes

- Passwords should be at least 8 characters long and include a combination of uppercase letters, lowercase letters, numbers, and special characters
- The password reset capability is restricted to administrators only
- There is no self-service password reset option to maintain high security standards
- Email communications for password resets should be kept confidential