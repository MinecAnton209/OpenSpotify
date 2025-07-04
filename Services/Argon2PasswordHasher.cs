using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;
using Microsoft.AspNetCore.Identity;

namespace OpenSpotify.API.Services
{
    public class Argon2PasswordHasher<TUser> : IPasswordHasher<TUser> where TUser : class
    {
        private const int DegreeOfParallelism = 2;
        private const int Iterations = 4;
        private const int MemorySize = 12288;

        public string HashPassword(TUser user, string password)
        {
            var salt = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = DegreeOfParallelism,
                Iterations = Iterations,
                MemorySize = MemorySize
            };

            var hash = argon2.GetBytes(16);

            var saltAndHash = new byte[salt.Length + hash.Length];
            Buffer.BlockCopy(salt, 0, saltAndHash, 0, salt.Length);
            Buffer.BlockCopy(hash, 0, saltAndHash, salt.Length, hash.Length);

            return Convert.ToBase64String(saltAndHash);
        }

        public PasswordVerificationResult VerifyHashedPassword(TUser user, string hashedPassword, string providedPassword)
        {
            try
            {
                var saltAndHash = Convert.FromBase64String(hashedPassword);
                var salt = new byte[16];
                var hash = new byte[16];

                if (saltAndHash.Length != 32)
                {
                    return PasswordVerificationResult.Failed;
                }
                
                Buffer.BlockCopy(saltAndHash, 0, salt, 0, salt.Length);
                Buffer.BlockCopy(saltAndHash, salt.Length, hash, 0, hash.Length);
                
                var argon2 = new Argon2id(Encoding.UTF8.GetBytes(providedPassword))
                {
                    Salt = salt,
                    DegreeOfParallelism = DegreeOfParallelism,
                    Iterations = Iterations,
                    MemorySize = MemorySize
                };

                var newHash = argon2.GetBytes(16);
                
                if (CryptographicOperations.FixedTimeEquals(hash, newHash))
                {
                    return PasswordVerificationResult.Success; 
                }
                
                return PasswordVerificationResult.Failed;
            }
            catch
            {
                return PasswordVerificationResult.Failed;
            }
        }
    }
}