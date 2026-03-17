/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2D6A4F",
        lightPrimary: "#10B981",
        lightPrimaryOpacity: "rgba(16, 185, 129, 0.1)",
        lightPrimaryOpacity2: "rgba(45, 106, 79, 0.2)",
        primaryOpacity: "rgba(45, 106, 79, 0.05)",
        pageBg: "#FCFBF9",
        pageBgDarker: "#F8F6F6",
        textDark: "#0F172A",
        textGray: "#475569",
        textLightGray: "#94A3B8",
        lightBlue: "#136DEC",
      },

      skinColors: {
        darkest: "#312529",
        deep: "#7D4E2E",
        olive: "#A57144",
        medium: "##E1B183",
        fair: "##F3D9C1",
        light: "#	#F9EBE0",
      },

      premiumColors: {
        dark: "#4B0082",
        light: "#8F00FF",
      },
      analysisColors: {
        positive: "#136DEC",
        positiveOpacity: "rgba(19, 109, 236, 0.05)",
        negative: "#E11D48",
        negativeOpacity: "rgba(225, 29, 72, 0.05)",
        neutral: "#F59E0B",
        neutralOpacity: "rgba(251, 191, 36, 0.05)",
      },
      fontFamily: {
        latoRegular: ["Lato-Regular"],
        latoSemiBold: ["Lato-Bold"],
        latoBlack: ["Lato-Black"],
        publicSansRegular: ["PublicSans-Regular"],
        publicSansBold: ["PublicSans-Bold"],
        publicSansSemiBold: ["PublicSans-SemiBold"],
        publicSansMedium: ["PublicSans-Medium"],
        publicSansExtraBold: ["PublicSans-ExtraBold"],
      },
    },
  },
  plugins: [],
};
