using EmpManagementAPI2.Interfaces;
using System.Security.Cryptography;

namespace EmpManagementAPI2.Services;

public class PasswordService : IPasswordService
{
    public void CreatePasswordHash(
        string password,
        out byte[] passwordHash,
        out byte[] passwordSalt)
    {
        passwordSalt = RandomNumberGenerator.GetBytes(32);

        passwordHash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            passwordSalt,
            100000,
            HashAlgorithmName.SHA512,
            64);
    }

    public bool VerifyPassword(
        string password,
        byte[] storedHash,
        byte[] storedSalt)
    {
        var computedHash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            storedSalt,
            100000,
            HashAlgorithmName.SHA512,
            64);

        return CryptographicOperations.FixedTimeEquals(
            computedHash,
            storedHash);
    }
}