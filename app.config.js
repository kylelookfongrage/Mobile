import dotenv from "dotenv";
dotenv.config();

module.exports = ({ config }) => {
    return {
        ...config,
        "extras": {
            STRIPE_API_KEY: process.env.STRIPE_API_KEY,
            REVENUE_CAT_APPLE_KEY: process.env.REVENUE_CAT_APPLE_KEY,
            REVENUE_CAT_ANDROID_KEY: process.env.REVENUE_CAT_ANDROID_KEY,
            OPENAI_API_KEY: process.env.OPENAI_API_KEY,
            EDAMAM_PROJECT_ID: process.env.EDAMAM_PROJECT_ID,
            EDAMAM_API_KEY: process.env.EDAMAM_API_KEY,
            DEFAULT_IMAGE_URI: process.env.DEFAULT_IMAGE_URI,
            AWS_AMPLIFY_CONFIG: process.env.AWS_AMPLIFY_CONFIG,
            GOOGLE_AD_UNIT: process.env.GOOGLE_AD_UNIT,
            APPLE_AD_UNIT: process.env.APPLE_AD_UNIT,
        }
    };
};
