import PrimaryButton from "@/components/PrimaryButton";
import { account } from "@/libs/appwrite";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
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

  const handleBack = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      saveProgress(prevStep, formData);
    } else if (step === 1) {
      return;
    } else {
      router.back();
    }
  };

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
  }: {
    title: string;
    value: string;
    selectedValue: string;
    onSelect: (v: string) => void;
    icon?: string;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onSelect(value)}
      className={`w-full p-5 rounded-2xl border mb-3 flex-row items-center ${
        selectedValue === value
          ? "bg-emerald-50 border-primary"
          : "bg-white border-gray-100"
      }`}
    >
      {icon && (
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
            selectedValue === value ? "bg-primary" : "bg-gray-50"
          }`}
        >
          <MaterialCommunityIcons
            name={icon as any}
            size={20}
            color={selectedValue === value ? "white" : "#475569"}
          />
        </View>
      )}
      <Text
        className={`flex-1 font-latoBold text-base ${
          selectedValue === value ? "text-primary" : "text-textDark"
        }`}
      >
        {title}
      </Text>
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
            <Text className="text-2xl font-latoBlack text-textDark mt-4 leading-tight">
              After washing your face and applying nothing, how does it feel
              after 1 hour?
            </Text>
            <Text className="text-base font-latoRegular text-textGray mt-2 mb-8">
              This determines your core skin type (Dry vs Oily).
            </Text>

            <SelectionCard
              title="Tight or Flaky"
              value="Dry"
              icon="water-off"
              selectedValue={formData.skinFeel}
              onSelect={(val) => setFormData({ ...formData, skinFeel: val })}
            />
            <SelectionCard
              title="Comfortable & Smooth"
              value="Normal"
              icon="check-decagram-outline"
              selectedValue={formData.skinFeel}
              onSelect={(val) => setFormData({ ...formData, skinFeel: val })}
            />
            <SelectionCard
              title="Shiny only on nose/forehead"
              value="Combination"
              icon="format-color-fill"
              selectedValue={formData.skinFeel}
              onSelect={(val) => setFormData({ ...formData, skinFeel: val })}
            />
            <SelectionCard
              title="Glistening or Oily all over"
              value="Oily"
              icon="water"
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
            <Text className="text-2xl font-latoBlack text-textDark mt-4 leading-tight">
              How often do you experience stinging, redness, or itching?
            </Text>
            <Text className="text-base font-latoRegular text-textGray mt-2 mb-8">
              Specifically when trying a new soap or cream.
            </Text>

            <SelectionCard
              title="Never (Resistant)"
              value="Resistant"
              icon="shield-check-outline"
              selectedValue={formData.sensitivity}
              onSelect={(val) => setFormData({ ...formData, sensitivity: val })}
            />
            <SelectionCard
              title="Rarely / Only with strong stuff"
              value="Moderate"
              icon="alert-outline"
              selectedValue={formData.sensitivity}
              onSelect={(val) => setFormData({ ...formData, sensitivity: val })}
            />
            <SelectionCard
              title="Frequently / Very picky skin"
              value="High"
              icon="fire"
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
            <Text className="text-2xl font-latoBlack text-textDark mt-4 leading-tight">
              Do you notice small bumps after using thick body lotions on your
              face?
            </Text>
            <Text className="text-base font-latoRegular text-textGray mt-2 mb-8">
              The "Breakout Trap" check for Acne Cosmetica.
            </Text>

            <SelectionCard
              title="Yes, I have to be careful"
              value="True"
              icon="emoticon-sad-outline"
              selectedValue={formData.breakouts}
              onSelect={(val) => setFormData({ ...formData, breakouts: val })}
            />
            <SelectionCard
              title="No, my face handles anything"
              value="False"
              icon="emoticon-happy-outline"
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
            <Text className="text-2xl font-latoBlack text-textDark mt-4 leading-tight">
              How does your skin react to 30 mins of hot sun without protection?
            </Text>
            <Text className="text-base font-latoRegular text-textGray mt-2 mb-8">
              Helps determine sensitivity and pigmentation risk.
            </Text>

            <SelectionCard
              title="Burn painfully, never tan"
              value="Fitz-1-2"
              icon="weather-sunny-alert"
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Burn first, then tan slowly"
              value="Fitz-3"
              icon="weather-sunny"
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Tan easily, rarely burn"
              value="Fitz-4"
              icon="sunglasses"
              selectedValue={formData.sunReaction}
              onSelect={(val) => setFormData({ ...formData, sunReaction: val })}
            />
            <SelectionCard
              title="Never burn; deeply pigmented"
              value="Fitz-5-6"
              icon="moon-waning-crescent"
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
            <Text className="text-2xl font-latoBlack text-textDark mt-4 leading-tight">
              Are you currently using any of these ingredients?
            </Text>
            <Text className="text-base font-latoRegular text-textGray mt-2 mb-8">
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
            <Text className="text-2xl font-latoBlack text-textDark mt-4 leading-tight">
              What is your primary skincare goal?
            </Text>
            <Text className="text-base font-latoRegular text-textGray mt-2 mb-8">
              We'll tailor your routine based on this objective.
            </Text>

            <SelectionCard
              title="Clear Dark Spots & Hyperpigmentation"
              value="Brightening"
              icon="star-four-points-outline"
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />
            <SelectionCard
              title="Smooth Fine Lines & Anti-aging"
              value="Anti-aging"
              icon="clock-check-outline"
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />
            <SelectionCard
              title="Fight Acne & Congestion"
              value="Clearing"
              icon="face-man-shimmer-outline"
              selectedValue={formData.primaryGoal}
              onSelect={(val) => setFormData({ ...formData, primaryGoal: val })}
            />
            <SelectionCard
              title="Hydration & Barrier Repair"
              value="Hydration"
              icon="emoticon-excited-outline"
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
            <Text className="text-lg font-latoRegular text-textGray text-center mt-4 mb-12">
              We've created a custom skin profile for you based on your unique
              diagnostics.
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
