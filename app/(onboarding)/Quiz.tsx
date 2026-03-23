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
  });

  const ageOptions = Array.from({ length: 85 }, (_, i) => (i + 16).toString());

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
    if (step < 8) {
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
      // Final Sync to Appwrite Prefs
      await account.updatePrefs({
        ...formData,
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
          Step: {step} of 8
        </Text>
      </View>
      <View className="w-full h-[6px] bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary"
          style={{ width: `${(step / 8) * 100}%` }}
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
  }: {
    title: string;
    subText: string;
    value: string;
    selectedValue: string;
    onSelect: (v: string) => void;
    icon?: ImageSourcePropType;
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
              <PrimaryButton
                text="Continue"
                callBack={handleNext}
                disabled={!formData.age || !formData.gender}
              />
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
              <PrimaryButton
                text="Next"
                callBack={handleNext}
                disabled={!formData.skinFeel}
              />
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
              <PrimaryButton
                text="Next"
                callBack={handleNext}
                disabled={!formData.sensitivity}
              />
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
              <PrimaryButton
                text="Next"
                callBack={handleNext}
                disabled={!formData.breakouts}
              />
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
              title="Burns easily, never tans"
              subText="My skin burns quickly and rarely tans in the sun."
              value="Fitz-1-2"
              icon={require("../../assets/images/Ellipse 2.png")}
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Burns first, tans slowly"
              subText="My skin usually burns a little before slowly tanning."
              value="Fitz-3"
              icon={require("../../assets/images/Ellipse 3.png")}
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Tans easily, rarely burns"
              subText="My skin tans easily and hardly ever burns."
              value="Fitz-4"
              icon={require("../../assets/images/Ellipse 4.png")}
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Rarely burns, very tanned"
              subText="My skin hardly ever burns and gets deeply tanned."
              value="Fitz-5-6"
              icon={require("../../assets/images/Ellipse 1.png")}
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />

            <View className="mt-8">
              <PrimaryButton
                text="Next"
                callBack={handleNext}
                disabled={!formData.sunReaction}
              />
            </View>
          </View>
        )}

        {step === 6 && (
          <View>
            <Text className={questionStyles}>
              Are you currently using any of these ingredients?
            </Text>
            <Text className={subTextStyles}>
              Select all that apply. This prevents active ingredient conflicts.
            </Text>

            {[
              "Retinol / Retinoids",
              "Vitamin C",
              "AHA (Glycolic/Lactic)",
              "BHA (Salicylic)",
              "Benzoyl Peroxide",
              "Hydroquinone",
            ].map((ing) => (
              <TouchableOpacity
                key={ing}
                onPress={() => toggleIngredient(ing)}
                className={`w-full p-5 rounded-2xl border mb-3 flex-row items-center ${
                  formData.activeIngredients.includes(ing)
                    ? "bg-emerald-50 border-primary"
                    : "bg-white border-gray-100"
                }`}
              >
                <Text
                  className={`flex-1 font-latoBold text-base ${
                    formData.activeIngredients.includes(ing)
                      ? "text-primary"
                      : "text-textDark"
                  }`}
                >
                  {ing}
                </Text>
                <Ionicons
                  name={
                    formData.activeIngredients.includes(ing)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color={
                    formData.activeIngredients.includes(ing)
                      ? "#2D6A4F"
                      : "#CBD5E1"
                  }
                />
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
              icon={require("../../assets/images/auth-hero-img.png")}
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />
            <SelectionCard
              title="Smooth Fine Lines & Anti-aging"
              subText="Reduce the appearance of fine lines and wrinkles."
              value="Anti-aging"
              icon={require("../../assets/images/auth-hero-img.png")}
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />
            <SelectionCard
              title="Fight Acne & Congestion"
              subText="Target active breakouts and clogged pores."
              value="Clearing"
              icon={require("../../assets/images/auth-hero-img.png")}
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />
            <SelectionCard
              title="Hydration & Barrier Repair"
              subText="Restore your skin's natural moisture and protective barrier."
              value="Hydration"
              icon={require("../../assets/images/auth-hero-img.png")}
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />

            <View className="mt-8">
              <PrimaryButton
                text="Almost Done"
                callBack={handleNext}
                disabled={!formData.primaryGoal}
              />
            </View>
          </View>
        )}

        {step === 8 && (
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
              <View className="flex-row items-center mb-3">
                <Ionicons name="person-outline" size={18} color="#475569" />
                <Text className="ml-3 font-latoBold text-textDark">
                  {formData.age} Year old {formData.gender}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="sparkles-outline" size={18} color="#475569" />
                <Text className="ml-3 font-latoBold text-textDark">
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
