import PrimaryButton from "@/components/PrimaryButton";
import { account } from "@/libs/appwrite";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Quiz = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgeModalVisible, setIsAgeModalVisible] = useState(false);
  const [showError, setShowError] = useState(false);

  const questionStyles =
    "text-3xl font-latoBlack text-textDark mt-4 leading-tight";
  const subTextStyles = "text-lg font-latoRegular text-textGray mt-2 mb-8";

  const [formData, setFormData] = useState({
    // Step 1: Profile
    age: "",
    gender: "",
    location: "",
    // Step 2: Baumann O/D
    skinFeel: "",
    // Step 3: Baumann S/R
    sensitivity: "",
    // Step 4: Acne Cosmetica
    breakouts: "",
    // Step 5: Fitzpatrick/Pigmentation
    sunReaction: "",
    // Step 6: Active Conflicts
    activeIngredients: [] as string[],
    // Step 7: Goal
    primaryGoal: "",
    // Step 8: Skin Tone
    skinTone: "",
  });

  const ageOptions = Array.from({ length: 85 }, (_, i) => (i + 13).toString());

  const skinToneOptions = [
    {
      id: "fair",
      label: "Fair",
      image: require("../../assets/images/fair-skin.png"),
      fitzMatch: ["Fitz-1"],
    },
    {
      id: "light",
      label: "Light",
      image: require("../../assets/images/ligjt.png"),
      fitzMatch: ["Fitz-2"],
    },
    {
      id: "olive",
      label: "Olive",
      image: require("../../assets/images/olive.png"),
      fitzMatch: ["Fitz-3"],
    },
    {
      id: "medium",
      label: "Medium",
      image: require("../../assets/images/meduim.png"),
      fitzMatch: ["Fitz-4"],
    },
    {
      id: "deep",
      label: "Deep",
      image: require("../../assets/images/deep.png"),
      fitzMatch: ["Fitz-5"],
    },
    {
      id: "darkest",
      label: "Darkest",
      image: require("../../assets/images/darkest.png"),
      fitzMatch: ["Fitz-6"],
    },
  ];

  // Mapping engine logic
  const mapToEngine = (data: typeof formData) => {
    // This will be used in step 9
    return {
      age: data.age,
      gender: data.gender.toLowerCase(),
      location: data.location,
      baumann_type: {
        hydration:
          data.skinFeel === "Dry"
            ? "type_dry"
            : data.skinFeel === "Normal"
              ? "type_normal"
              : data.skinFeel === "Combination"
                ? "type_combination"
                : "type_oily",
        sensitivity:
          data.sensitivity === "High"
            ? "type_sensitive"
            : data.sensitivity === "Moderate"
              ? "type_moderate"
              : "type_resistant",
        pigment:
          data.sunReaction === "Fitz-1" || data.sunReaction === "Fitz-2"
            ? "type_non_pigmented"
            : data.sunReaction === "Fitz-3"
              ? "type_medium_pigmented"
              : "type_pigmented", // Fitz 4, 5, 6
        elasticity: (() => {
          // 1. Establish Base Age
          let ageValue = parseInt(data.age) || 25;
          let threshold = 35;

          // 2. Hydration Offset (The "Baumann" Factor)
          if (data.skinFeel === "Dry") threshold -= 5;
          if (data.skinFeel === "Oily") threshold += 5;

          // 3. Pigment Offset (UV/Dermis Protection Logic)
          if (data.sunReaction === "Fitz-1" || data.sunReaction === "Fitz-2") {
            // Non-pigmented: High UV damage risk, thinner dermis.
            threshold -= 5;
          } else if (data.sunReaction === "Fitz-3") {
            // Medium Pigmented (The Pivot Point):
            // "Burn then Tan" group. Moderate protection but still prone to structural collapse.
            threshold += 2;
          } else {
            // Pigmented (Fitz-4, 5, 6):
            // "Rarely Burn" group. Thick dermis and natural "SPF 10+" equivalent.
            // Stays in tight/elastic phase ~7-10 years longer than non-pigmented.
            threshold += 10;
          }

          // 4. Gender Offset
          if (data.gender.toLowerCase() === "male") threshold += 3;

          // 5. Sensitivity Modifier
          if (data.sensitivity === "High") threshold -= 3;

          // Final Decision
          return ageValue >= threshold
            ? "type_wrinkle_prone"
            : "type_tight_elastic";
        })(),
      },
      pore_profile: {
        acne_prone: data.breakouts === "True",
        status:
          data.breakouts === "True"
            ? "highly_comedogenic_reactive"
            : "pore_resilient",
      },
      fitzpatrick: data.sunReaction,
      skin_tone: data.skinTone,
      active_ingredients: {
        retinol: data.activeIngredients.includes("Retinol / Vitamin A"),
        vit_c: data.activeIngredients.includes("Vitamin C"),
        acids: data.activeIngredients.includes("AHA / BHA acids"),
        bp: data.activeIngredients.includes(" Benzoyl Peroxide"),
      },
      goal: data.primaryGoal,
    };
  };

  // Load persistence
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedData = await AsyncStorage.getItem("onboarding_data");
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setStep(parsed.step || 1);
          setFormData((prev) => ({ ...prev, ...parsed.data }));
        }
      } catch (e) {
        console.error("Failed to load progress", e);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  // Save persistence
  const saveProgress = async (nextStep: number, currentData: any) => {
    try {
      await AsyncStorage.setItem(
        "onboarding_data",
        JSON.stringify({ step: nextStep, data: currentData }),
      );
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  const handleNext = async () => {
    // Validation check for current step
    let isValid = true;
    switch (step) {
      case 1:
        isValid = !!(formData.age && formData.gender && formData.location);
        break;
      case 2:
        isValid = !!formData.skinFeel;
        break;
      case 3:
        isValid = !!formData.sensitivity;
        break;
      case 4:
        isValid = !!formData.breakouts;
        break;
      case 5:
        isValid = !!formData.sunReaction;
        break;
      case 6:
        // Optional usually, but we can enforce selection if needed
        isValid = formData.activeIngredients.length > 0;
        break;
      case 7:
        isValid = !!formData.primaryGoal;
        break;
      case 8:
        isValid = !!formData.skinTone;
        break;
    }

    if (!isValid) {
      setShowError(true);
      // Auto-hide error after 3 seconds
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setShowError(false);
    if (step < 9) {
      const nextStep = step + 1;
      setStep(nextStep);
      saveProgress(nextStep, formData);
    } else {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const clinicalProfile = mapToEngine(formData);
      // Final Sync to Appwrite Prefs
      await account.updatePrefs({
        ...formData,
        clinicalProfile: JSON.stringify(clinicalProfile),
        onboardingComplete: true,
      });

      // Clear local persistence
      await AsyncStorage.removeItem("onboarding_data");
      // AuthProvider's useEffect will catch the update and redirect to /
    } catch (e) {
      console.error("Failed to complete onboarding", e);
      setIsSubmitting(false);
    }
  };

  const handleBack = useCallback(() => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      saveProgress(prevStep, formData);
      return true; // We handled the back button
    } else if (step === 1) {
      router.replace("/welcome");
      return true;
    } else {
      router.back();
      return true;
    }
  }, [step, formData]);

  // Handle hardware back button
  useEffect(() => {
    const onBackPress = () => {
      return handleBack();
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [handleBack]);

  const toggleIngredient = (ingredient: string) => {
    setFormData((prev) => {
      const current = prev.activeIngredients;
      if (current.includes(ingredient)) {
        return {
          ...prev,
          activeIngredients: current.filter((i) => i !== ingredient),
        };
      }
      return { ...prev, activeIngredients: [...current, ingredient] };
    });
  };

  if (loading) return null;

  const renderProgress = () => (
    <View className="px-6 mb-6">
      <View className="flex-row justify-between items-end mb-2">
        <Text className="font-publicSansBold text-primary uppercase text-[10px] tracking-widest">
          {step === 1 ? "Profile Setup" : `Question ${step - 1}`}
        </Text>
        <Text className="font-publicSansMedium text-textGray text-xs">
          Step: {step} of 9
        </Text>
      </View>
      <View className="w-full h-[6px] bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary"
          style={{ width: `${(step / 9) * 100}%` }}
        />
      </View>
    </View>
  );

  const SelectionCard = ({
    title,
    value,
    selectedValue,
    onSelect,
    icon,
    subText,
    systemIcon,
  }: {
    title: string;
    subText: string;
    value: string;
    selectedValue: string;
    onSelect: (v: string) => void;
    icon?: ImageSourcePropType;
    systemIcon?: keyof typeof Ionicons.glyphMap;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onSelect(value)}
      className={"w-full p-5 rounded-2xl h-[120px] mb-3 flex-row items-center"}
      style={{
        backgroundColor:
          selectedValue === value ? "rgba(45, 106, 79, 0.05)" : "white",
        borderWidth: selectedValue === value ? 2 : 0,
        borderColor: "#2D6A4F",
      }}
    >
      <View
        style={{
          backgroundColor:
            selectedValue === value ? "rgba(16, 185, 129, 0.1)" : "#F1F5F9",
        }}
        className="items-center mr-6 justify-center w-[60px] h-[60px] rounded-2xl bg-lightPrimaryOpacity"
      >
        {icon && (
          <View
            className={"w-10 h-10 rounded-full items-center justify-center"}
          >
            <Image resizeMode="contain" className="w-6 h-6" source={icon} />
          </View>
        )}
        {systemIcon && (
          <Ionicons
            name={systemIcon}
            size={24}
            color={selectedValue === value ? "#2D6A4F" : "#475569"}
          />
        )}
      </View>
      <View className="flex-1 mr-4 gap-1">
        <Text
          className={`font-latoBold text-[16px] text-textDark text-xl font-publicSansBold`}
        >
          {title}
        </Text>
        <Text
          className={`font-latoBold text-[14px] font-publicSansRegular leading-6`}
          style={{ color: "#64748B" }}
        >
          {subText}
        </Text>
      </View>
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
          selectedValue === value ? "border-primary" : "border-gray-200"
        }`}
      >
        {selectedValue === value && (
          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-pageBg">
      {/* Custom Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="font-latoSemiBold text-xl text-textDark">
          {step === 1 ? "Getting Started" : "Diagnostic"}
        </Text>
        <View className="w-10" />
      </View>

      {renderProgress()}

      {showError && (
        <View className="mx-6 mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex-row items-center">
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text className="ml-2 font-publicSansMedium text-red-600">
            Please complete the current step to continue.
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
      >
        {step === 1 && (
          <View>
            <Text className="text-3xl font-latoBlack text-textDark mt-4 leading-tight">
              Tell us about yourself
            </Text>
            <Text className="text-lg font-latoRegular text-textGray mt-2 mb-8">
              This helps us personalize your skincare journey.
            </Text>

            {/* Age Selection */}
            <Text className="font-publicSansBold text-textGray mb-2 text-sm">
              How old are you?
            </Text>
            <TouchableOpacity
              onPress={() => setIsAgeModalVisible(true)}
              activeOpacity={0.7}
              className="w-full h-16 bg-white border border-gray-100 rounded-2xl flex-row items-center justify-between px-4 mb-6"
            >
              <Text
                className={`font-latoRegular text-base ${formData.age ? "text-textDark" : "text-textLightGray"}`}
              >
                {formData.age ? `${formData.age} years old` : "Select your age"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#475569" />
            </TouchableOpacity>

            {/* Gender Selection */}
            <Text className="font-publicSansBold text-textGray mb-4 text-sm">
              Gender Identity
            </Text>
            <View className="flex-row justify-between mb-8">
              {["Female", "Male", "Other"].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  onPress={() => setFormData({ ...formData, gender })}
                  className={`w-[30%] aspect-square rounded-2xl border items-center justify-center`}
                  style={{
                    backgroundColor: "white",
                    borderColor:
                      formData.gender === gender ? "#2D6A4F" : "#E5E7EB",
                  }}
                >
                  <MaterialCommunityIcons
                    name={
                      gender === "Female"
                        ? "gender-female"
                        : gender === "Male"
                          ? "gender-male"
                          : "gender-non-binary"
                    }
                    size={32}
                    color={formData.gender === gender ? "#2D6A4F" : "#475569"}
                  />
                  <Text
                    className={`mt-2 font-publicSansMedium text-xs ${
                      formData.gender === gender
                        ? "text-primary"
                        : "text-textGray"
                    }`}
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Location Section */}
            <Text className="font-publicSansBold text-textGray mb-2 text-sm">
              Where are you located?
            </Text>
            <View className="w-full bg-white border border-gray-100 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-1">
                <Ionicons name="location-outline" size={20} color="#475569" />
                <TextInput
                  placeholder="Search for city or country"
                  className="flex-1 h-12 ml-2 font-latoRegular"
                  value={formData.location}
                  onChangeText={(text) =>
                    setFormData({ ...formData, location: text })
                  }
                />
                <TouchableOpacity className="bg-emerald-50 px-3 py-2 rounded-lg">
                  <Text className="text-primary font-publicSansBold text-xs">
                    Detect
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-4">
              <PrimaryButton text="Continue" callBack={handleNext} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className={questionStyles}>
              If you wash your face and apply nothing, how does your skin feel
              after 1 hour?
            </Text>
            <Text className={subTextStyles}>
              This determines your core skin type (Dry vs Oily).
            </Text>

            <SelectionCard
              title="Tight and dry"
              subText="Feels like it needs immediate moisture or stretching"
              value="Dry"
              icon={require("../../assets/images/dry.png")}
              selectedValue={formData.skinFeel}
              onSelect={(val) => setFormData({ ...formData, skinFeel: val })}
            />
            <SelectionCard
              title="Normal"
              subText="Neither particularly dry nor oily, feels comfortable"
              value="Normal"
              icon={require("../../assets/images/normal.png")}
              selectedValue={formData.skinFeel}
              onSelect={(val) => setFormData({ ...formData, skinFeel: val })}
            />
            <SelectionCard
              title="Combination"
              subText="Shiny appearance particularly on the nose/forehead"
              value="Combination"
              icon={require("../../assets/images/combination.png")}
              selectedValue={formData.skinFeel}
              onSelect={(val) => setFormData({ ...formData, skinFeel: val })}
            />
            <SelectionCard
              title="Oily"
              subText="Your skin appears shiny and oily across the whole face."
              value="Oily"
              icon={require("../../assets/images/oily.png")}
              selectedValue={formData.skinFeel}
              onSelect={(val) => setFormData({ ...formData, skinFeel: val })}
            />

            <View className="mt-8">
              <PrimaryButton text="Next" callBack={handleNext} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className={questionStyles}>
              How often does your skin sting, turn red, or itch when you try a
              new soap or cream?
            </Text>
            <Text className={subTextStyles}>
              Pick the option that best describes your skin’s reaction to new
              products.
            </Text>

            <SelectionCard
              title="Never"
              subText="My skin hardly ever reacts to new soaps or creams."
              value="Resistant"
              icon={require("../../assets/images/soap.png")}
              selectedValue={formData.sensitivity}
              onSelect={(val) => setFormData({ ...formData, sensitivity: val })}
            />
            <SelectionCard
              title="Moderate"
              subText="Sometimes my skin feels a little stingy, red, or itchy."
              value="Moderate"
              icon={require("../../assets/images/normal.png")}
              selectedValue={formData.sensitivity}
              onSelect={(val) => setFormData({ ...formData, sensitivity: val })}
            />
            <SelectionCard
              title="High"
              subText="My skin reacts often or strongly whenever I try new products."
              value="High"
              icon={require("../../assets/images/react-icon.png")}
              selectedValue={formData.sensitivity}
              onSelect={(val) => setFormData({ ...formData, sensitivity: val })}
            />

            <View className="mt-8">
              <PrimaryButton text="Next" callBack={handleNext} />
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text className={questionStyles}>
              Do you notice small, rough bumps or pimples on your face after
              using thick body lotions or hair oils?
            </Text>
            <Text className={subTextStyles}>
              Pick the option that best describes how your skin reacts to heavy
              lotions or oils.
            </Text>

            <SelectionCard
              title="Yes, face-only products"
              subText="I stick to face products because others can cause bumps."
              value="True"
              icon={require("../../assets/images/oily.png")}
              selectedValue={formData.breakouts}
              onSelect={(val) => setFormData({ ...formData, breakouts: val })}
            />
            <SelectionCard
              title="No, my skin handles it"
              subText="I rarely get bumps from body lotions or hair oils."
              value="False"
              icon={require("../../assets/images/normal.png")}
              selectedValue={formData.breakouts}
              onSelect={(val) => setFormData({ ...formData, breakouts: val })}
            />

            <View className="mt-8">
              <PrimaryButton text="Next" callBack={handleNext} />
            </View>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text className={questionStyles}>
              How does your skin feel after spending 30 minutes in the hot
              afternoon sun without any protection?
            </Text>
            <Text className={subTextStyles}>
              Pick the description that best matches your skin’s natural
              reaction.
            </Text>

            <SelectionCard
              title="Always burns, never tans"
              subText="My skin is very sensitive to sunlight and always turns red."
              value="Fitz-1"
              icon={require("../../assets/images/Ellipse 2.png")}
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Burns easily, tans a little"
              subText="My skin burns very easily and is difficult to tan."
              value="Fitz-2"
              icon={require("../../assets/images/Ellipse 2.png")}
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Burns first, tans slowly"
              subText="My skin often gets a mild burn before it starts to tan."
              value="Fitz-3"
              icon={require("../../assets/images/Ellipse 3.png")}
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Tans easily, rarely burns"
              subText="My skin tans very well and hardly ever gets a sunburn."
              value="Fitz-4"
              icon={require("../../assets/images/Ellipse 4.png")}
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Tans very easily, almost never burns"
              subText="My skin gets dark very quickly and is very resistant to the sun."
              value="Fitz-5"
              icon={require("../../assets/images/Ellipse 4.png")}
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Never burns, always tans deeply"
              subText="My skin is naturally very dark and does not burn in the sun."
              value="Fitz-6"
              icon={require("../../assets/images/Ellipse 1.png")}
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />

            <View className="mt-8">
              <PrimaryButton text="Next" callBack={handleNext} />
            </View>
          </View>
        )}

        {step === 6 && (
          <View>
            <Text className={questionStyles}>
              Do you use any “power ingredients” in your skincare routine?
            </Text>
            <Text className={subTextStyles}>
              These ingredients can make your skin sensitive if mixed with
              certain products.
            </Text>

            {[
              {
                active: "Retinol / Vitamin A",
                icon: require("../../assets/images/moon.png"),
                subText: "Helps with wrinkles and cell turnover.",
              },
              {
                active: "Vitamin C",
                icon: require("../../assets/images/sun.png"),
                subText: "Brightens skin and protects from damage.",
              },
              {
                active: "AHA / BHA acids",
                icon: require("../../assets/images/diamond.png"),
                subText: "Exfoliates dead skin for smoother texture.",
              },
              {
                active: " Benzoyl Peroxide",
                icon: require("../../assets/images/shield.png"),
                subText: "Targets acne and reduces breakouts.",
              },
              {
                active: "Not sure / None",
                icon: require("../../assets/images/question-mark.png"),
                subText: "I’m not sure or don’t use any of these ingredients.",
              },
            ].map((ing) => (
              <TouchableOpacity
                key={ing.active}
                onPress={() => toggleIngredient(ing.active)}
                className={
                  "w-full p-5 rounded-2xl h-[120px] mb-3 flex-row items-center"
                }
                style={{
                  backgroundColor: formData.activeIngredients.includes(
                    ing.active,
                  )
                    ? "rgba(45, 106, 79, 0.05)"
                    : "white",
                  borderWidth: formData.activeIngredients.includes(ing.active)
                    ? 2
                    : 0,
                  borderColor: "#2D6A4F",
                }}
              >
                <View
                  style={{
                    backgroundColor: formData.activeIngredients.includes(
                      ing.active,
                    )
                      ? "rgba(16, 185, 129, 0.1)"
                      : "#F1F5F9",
                  }}
                  className="items-center mr-6 justify-center w-[60px] h-[60px] rounded-2xl bg-lightPrimaryOpacity"
                >
                  <View
                    className={
                      "w-10 h-10 rounded-full items-center justify-center"
                    }
                  >
                    <Image
                      resizeMode="contain"
                      className="w-6 h-6"
                      source={ing.icon}
                    />
                  </View>
                </View>
                <View className="flex-1 mr-4 gap-1">
                  <Text
                    className={`font-latoBold text-[16px] text-textDark text-xl font-publicSansBold`}
                  >
                    {ing.active}
                  </Text>
                  <Text
                    className={`font-latoBold text-[14px] font-publicSansRegular leading-6`}
                    style={{ color: "#64748B" }}
                  >
                    {ing.subText}
                  </Text>
                </View>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    formData.activeIngredients.includes(ing.active)
                      ? "border-primary"
                      : "border-gray-200"
                  }`}
                >
                  {formData.activeIngredients.includes(ing.active) && (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <View className="mt-8">
              <PrimaryButton text="Continue" callBack={handleNext} />
            </View>
          </View>
        )}

        {step === 7 && (
          <View>
            <Text className={questionStyles}>
              What is your primary skincare goal?
            </Text>
            <Text className={subTextStyles}>
              We&apos;ll tailor your routine based on this objective.
            </Text>

            <SelectionCard
              title="Clear Dark Spots & Hyperpigmentation"
              subText="Target dark spots and uneven skin tone."
              value="Brightening"
              systemIcon="sparkles-outline"
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />
            <SelectionCard
              title="Smooth Fine Lines & Anti-aging"
              subText="Reduce the appearance of fine lines and wrinkles."
              value="Anti-aging"
              systemIcon="hourglass-outline"
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />
            <SelectionCard
              title="Fight Acne & Congestion"
              subText="Target active breakouts and clogged pores."
              value="Clearing"
              systemIcon="shield-checkmark-outline"
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />
            <SelectionCard
              title="Hydration & Barrier Repair"
              subText="Restore your skin's natural moisture and protective barrier."
              value="Hydration"
              systemIcon="water-outline"
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />

            <View className="mt-8">
              <PrimaryButton text="Almost Done" callBack={handleNext} />
            </View>
          </View>
        )}

        {step === 8 && (
          <View>
            <Text className={questionStyles}>Skin Tone Analysis</Text>
            <Text className={subTextStyles}>
              Select the option that most closely matches your natural,
              un-tanned skin tone. This helps our scanner calibrate for your
              unique profile.
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {skinToneOptions.map((tone) => (
                <TouchableOpacity
                  key={tone.id}
                  onPress={() =>
                    setFormData({ ...formData, skinTone: tone.id })
                  }
                  className="w-[48%] h-72 mb-4 bg-white rounded-3xl border-2 overflow-hidden"
                  style={{
                    borderColor:
                      formData.skinTone === tone.id ? "#2D6A4F" : "transparent",
                  }}
                >
                  <View className="p-4 items-center">
                    <Image
                      source={tone.image}
                      className="w-44 h-44 rounded-3xl mb-3"
                      resizeMode="cover"
                    />
                    <Text
                      className="font-publicSansBold text-base text-textDark"
                      style={{
                        marginTop: tone.fitzMatch.includes(formData.sunReaction)
                          ? 0
                          : 20,
                      }}
                    >
                      {tone.label}
                    </Text>

                    {/* Auto Recommendation Badge */}
                    {tone.fitzMatch.includes(formData.sunReaction) && (
                      <View className="mt-2 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                        <Text className="text-[10px] font-publicSansBold text-primary uppercase">
                          Auto Recommended
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-4 bg-amber-50 p-4 rounded-2xl border border-amber-100 flex-row items-center">
              <Ionicons name="alert-circle" size={24} color="#D97706" />
              <Text className="flex-1 ml-3 text-sm font-latoBold text-amber-800 leading-5">
                Accuracy Note: Your selection will influence the clinical scan
                results and skin health outcomes. Choose carefully.
              </Text>
            </View>

            <View className="mt-12">
              <PrimaryButton text="Final Step" callBack={handleNext} />
            </View>
          </View>
        )}

        {step === 9 && (
          <View className="items-center py-10">
            <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-6">
              <MaterialCommunityIcons
                name="check-bold"
                size={48}
                color="#2D6A4F"
              />
            </View>
            <Text className="text-3xl font-latoBlack text-textDark text-center">
              Profile Complete!
            </Text>
            <Text className={subTextStyles}>
              We&apos;ve created a custom skin profile for you based on your
              unique diagnostics.
            </Text>

            <View className="w-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-12">
              <Text className="font-publicSansBold text-textGray uppercase text-xs tracking-widest mb-4">
                Your Profile Summary
              </Text>
              <View className="flex-row items-center mb-4">
                <Ionicons name="person-outline" size={18} color="#475569" />
                <Text className="ml-3 font-latoBold text-textDark text-lg">
                  {formData.age} Year {formData.gender}
                </Text>
              </View>
              <View className="flex-row items-center mb-4">
                <Ionicons name="water-outline" size={18} color="#475569" />
                <Text className="ml-3 font-latoBold text-textDark text-lg">
                  Skin: {formData.skinFeel} ({formData.sensitivity})
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="sparkles-outline" size={18} color="#475569" />
                <Text className="ml-3 font-latoBold text-textDark text-lg">
                  Focus: {formData.primaryGoal}
                </Text>
              </View>
            </View>

            <PrimaryButton
              text="Analyze My Skin"
              hasLoading={isSubmitting}
              callBack={completeOnboarding}
            />
          </View>
        )}
      </ScrollView>

      {/* Age Picker Modal */}
      <Modal
        visible={isAgeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAgeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAgeModalVisible(false)}>
          <View className="flex-1 justify-end bg-black/40">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-[40px] px-6 pt-10 pb-12 h-[60%]">
                <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-8" />
                <Text className="text-2xl font-latoBlack text-textDark mb-6 text-center">
                  Select your age
                </Text>

                <FlatList
                  data={ageOptions}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setFormData({ ...formData, age: item });
                        setIsAgeModalVisible(false);
                      }}
                      className={`py-4 items-center rounded-2xl mb-2 ${
                        formData.age === item
                          ? "bg-emerald-50 border border-emerald-100"
                          : ""
                      }`}
                    >
                      <Text
                        className={`text-xl ${
                          formData.age === item
                            ? "font-latoBold text-primary"
                            : "font-latoRegular text-textDark"
                        }`}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default Quiz;
