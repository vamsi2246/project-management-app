const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://project-management-app-89n4.onrender.com/api/users/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await prisma.user.findUnique({
                    where: { googleId: profile.id },
                });

                if (existingUser) return done(null, existingUser);

                const newUser = await prisma.user.create({
                    data: {
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        profilePic: profile.photos[0].value,
                    },
                });

                return done(null, newUser);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
