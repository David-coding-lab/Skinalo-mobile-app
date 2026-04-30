import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    BackHandler,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "@/components/PrimaryButton";
import { useScan } from "@/context/ScanProvider";
import {
    PRODUCT_CATEGORIES,
    PRODUCT_CATEGORY_DETAILS,
} from "@/types/productCategory";

function getMutationMessage(reason?: "EMPTY" | "DUPLICATE" | "OUT_OF_RANGE") {
  if (reason === "EMPTY") {
    return "Ingredient cannot be empty.";
  }

  if (reason === "DUPLICATE") {
    return "This ingredient already exists in your list.";
  }

  return "Could not update ingredient. Try again.";
}

export default function ManualInput() {
  const {
    selectedCategory,
    setSelectedCategory,
    extractedIngredients,
    addIngredient,
    updateIngredient,
    removeIngredient,
    clearCapturedImage,
  } = useScan();
  const [newIngredient, setNewIngredient] = useState("");
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [newIngredientNotice, setNewIngredientNotice] = useState<string | null>(
    null,
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingNotice, setEditingNotice] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?:
      | "alert-circle-outline"
      | "trash-outline"
      | "information-circle-outline";
    iconColor?: string;
    iconBg?: string;
    buttons: {
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }[];
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  const showAlert = (
    title: string,
    message: string,
    buttons: {
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }[],
    icon:
      | "alert-circle-outline"
      | "trash-outline"
      | "information-circle-outline" = "alert-circle-outline",
    iconColor: string = "#B91C1C",
    iconBg: string = "#FEF2F2",
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons,
      icon,
      iconColor,
      iconBg,
    });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const ingredientCountLabel = useMemo(() => {
    if (extractedIngredients.length === 1) {
      return "1 item";
    }

    return `${extractedIngredients.length} items`;
  }, [extractedIngredients.length]);

  const selectedCategoryDetails = selectedCategory
    ? PRODUCT_CATEGORY_DETAILS[selectedCategory]
    : null;

  const handleChangeCategory = (
    category: (typeof PRODUCT_CATEGORIES)[number],
  ) => {
    setSelectedCategory(category);
    setShowCategoryList(false);
  };

  const beginEdit = (index: number, ingredient: string) => {
    setEditingIndex(index);
    setEditingValue(ingredient);
    setEditingNotice(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
    setEditingNotice(null);
  };

  const commitEdit = () => {
    if (editingIndex === null) {
      return;
    }

    const result = updateIngredient(editingIndex, editingValue);
    if (!result.ok) {
      setEditingNotice(getMutationMessage(result.reason));
      return;
    }

    Keyboard.dismiss();
    cancelEdit();
  };

  const handleAddIngredient = () => {
    const result = addIngredient(newIngredient);

    if (!result.ok) {
      setNewIngredientNotice(getMutationMessage(result.reason));
      return;
    }

    setNewIngredient("");
    setNewIngredientNotice(null);
    Keyboard.dismiss();
  };

  const handleRemoveIngredient = (index: number) => {
    showAlert(
      "Remove ingredient",
      "Are you sure you want to remove this ingredient?",
      [
        {
          style: "cancel",
          text: "Cancel",
        },
        {
          style: "destructive",
          text: "Remove",
          onPress: () => {
            removeIngredient(index);

            if (editingIndex === index) {
              cancelEdit();
            }
          },
        },
      ],
      "trash-outline",
      "#B91C1C",
      "#FEF2F2",
    );
  };

  const handleReturnToInstructions = useCallback(() => {
    clearCapturedImage();
    router.replace("/(scan)/ScanInstructions");
  }, [clearCapturedImage]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleReturnToInstructions();
          return true;
        },
      );

      return () => {
        subscription.remove();
      };
    }, [handleReturnToInstructions]),
  );

  return (
    <SafeAreaView className="flex-1 bg-pageBg" edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 24,
            paddingTop: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-3xl border border-[#DCE4EF] bg-white px-6 py-8">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="font-publicSansBold text-3xl text-[#0F172A]">
                  Ingredient Editor
                </Text>

                <Text className="mt-3 font-publicSansRegular text-base leading-6 text-[#64748B]">
                  Fine-tune the ingredient list before analysis. You can edit,
                  remove, or add ingredients manually.
                </Text>
              </View>

              <View className="rounded-full bg-[#EAF3FF] px-3 py-1">
                <Text className="font-publicSansSemiBold text-xs tracking-[0.7px] text-[#1D4ED8]">
                  MANUAL MODE
                </Text>
              </View>
            </View>

            <View className="mt-6 rounded-2xl border border-[#D6EADB] bg-[#F2FBF5] px-4 py-4">
              <View className="flex-row items-start gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#DCFCE7]">
                  <Ionicons name="leaf-outline" size={21} color="#166534" />
                </View>

                <View className="flex-1">
                  <Text className="font-publicSansSemiBold text-xs tracking-[0.6px] text-[#2D6A4F]">
                    SELECTED CATEGORY
                  </Text>
                  <Text className="mt-1 font-publicSansBold text-xl text-[#0F172A]">
                    {selectedCategory || "General skincare"}
                  </Text>
                  <Text className="mt-1 font-publicSansRegular text-sm text-[#5C7C6D]">
                    {selectedCategoryDetails?.subtitle ||
                      "Choose the closest match for this product."}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setShowCategoryList((previous) => !previous)}
                  accessibilityRole="button"
                  accessibilityLabel="Change selected category"
                  className="flex-row items-center gap-1 rounded-full bg-[#2D6A4F] px-4 py-2"
                >
                  <Text className="font-publicSansSemiBold text-sm text-white">
                    Change
                  </Text>
                  <Ionicons
                    name={
                      showCategoryList
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                    size={16}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>

              {showCategoryList ? (
                <View className="mt-4 rounded-2xl border border-[#D8E7DD] bg-white p-3">
                  <Text className="px-1 font-publicSansSemiBold text-xs tracking-[0.6px] text-[#64748B]">
                    CHOOSE A CATEGORY
                  </Text>

                  <View className="mt-3 gap-2">
                    {PRODUCT_CATEGORIES.map((category) => {
                      const details = PRODUCT_CATEGORY_DETAILS[category];
                      const isSelected = selectedCategory === category;

                      return (
                        <Pressable
                          key={category}
                          onPress={() => handleChangeCategory(category)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          className="flex-row items-center gap-3 rounded-2xl border px-3 py-3"
                          style={{
                            borderColor: isSelected ? "#2D6A4F" : "#E2E8F0",
                            backgroundColor: isSelected ? "#F2FBF5" : "#FFFFFF",
                          }}
                        >
                          <View
                            className="h-10 w-10 items-center justify-center rounded-xl"
                            style={{
                              backgroundColor: isSelected
                                ? "#2D6A4F"
                                : "#EEF2F7",
                            }}
                          >
                            <Ionicons
                              name={details.iconName}
                              size={18}
                              color={isSelected ? "#FFFFFF" : "#2D6A4F"}
                            />
                          </View>

                          <View className="flex-1">
                            <Text className="font-publicSansSemiBold text-[15px] text-[#0F172A]">
                              {category}
                            </Text>
                            <Text className="mt-0.5 font-publicSansRegular text-sm text-[#64748B]">
                              {details.subtitle}
                            </Text>
                          </View>

                          {isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="#2D6A4F"
                            />
                          ) : (
                            <Ionicons
                              name="ellipse-outline"
                              size={18}
                              color="#CBD5E1"
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>

            <View className="mt-5 rounded-2xl bg-[#F8FAFC] px-4 py-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-publicSansSemiBold text-sm tracking-[0.6px] text-[#2563EB]">
                  INGREDIENT LIST
                </Text>
                <Text className="rounded-full bg-[#E2E8F0] px-3 py-1 font-publicSansSemiBold text-xs text-[#334155]">
                  {ingredientCountLabel}
                </Text>
              </View>

              {extractedIngredients.length > 0 ? (
                <View className="mt-3 gap-3">
                  {extractedIngredients.map((ingredient, index) => {
                    const isEditing = editingIndex === index;

                    return (
                      <View
                        key={`${ingredient}-${index}`}
                        className="rounded-2xl border border-[#E2E8F0] bg-white px-3 py-3"
                      >
                        <View className="flex-row items-center gap-3">
                          <View className="h-8 w-8 items-center justify-center rounded-full bg-[#2D6A4F]">
                            <Text className="font-publicSansSemiBold text-xs text-white">
                              {index + 1}
                            </Text>
                          </View>

                          {isEditing ? (
                            <TextInput
                              value={editingValue}
                              onChangeText={(value) => {
                                setEditingValue(value);
                                setEditingNotice(null);
                              }}
                              onSubmitEditing={commitEdit}
                              autoCapitalize="none"
                              autoCorrect={false}
                              maxLength={100}
                              returnKeyType="done"
                              className="h-12 flex-1 rounded-xl border border-[#CBD5E1] px-3 font-publicSansRegular text-base text-[#0F172A]"
                            />
                          ) : (
                            <Text className="flex-1 font-publicSansRegular text-base text-[#0F172A]">
                              {ingredient}
                            </Text>
                          )}

                          {isEditing ? (
                            <View className="flex-row items-center gap-2">
                              <Pressable
                                onPress={commitEdit}
                                accessibilityRole="button"
                                accessibilityLabel="Save ingredient edit"
                                className="h-9 w-9 items-center justify-center rounded-full bg-[#DCFCE7]"
                              >
                                <Ionicons
                                  name="checkmark-outline"
                                  size={20}
                                  color="#15803D"
                                />
                              </Pressable>
                              <Pressable
                                onPress={cancelEdit}
                                accessibilityRole="button"
                                accessibilityLabel="Cancel ingredient edit"
                                className="h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F9]"
                              >
                                <Ionicons
                                  name="close-outline"
                                  size={20}
                                  color="#334155"
                                />
                              </Pressable>
                            </View>
                          ) : (
                            <View className="flex-row items-center gap-2">
                              <Pressable
                                onPress={() => {
                                  beginEdit(index, ingredient);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="Edit ingredient"
                                className="h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF]"
                              >
                                <Ionicons
                                  name="create-outline"
                                  size={18}
                                  color="#3730A3"
                                />
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  handleRemoveIngredient(index);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="Remove ingredient"
                                className="h-9 w-9 items-center justify-center rounded-full bg-[#FEF2F2]"
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={18}
                                  color="#B91C1C"
                                />
                              </Pressable>
                            </View>
                          )}
                        </View>

                        {isEditing && editingNotice ? (
                          <Text className="mt-2 pl-11 font-publicSansRegular text-sm text-[#B91C1C]">
                            {editingNotice}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text className="mt-3 font-publicSansRegular text-base text-[#64748B]">
                  No ingredients yet. Add your first ingredient below.
                </Text>
              )}

              <View className="mt-4 rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-3 py-3">
                <Text className="font-publicSansSemiBold text-xs tracking-[0.5px] text-[#334155]">
                  ADD INGREDIENT
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <TextInput
                    value={newIngredient}
                    onChangeText={(value) => {
                      setNewIngredient(value);
                      setNewIngredientNotice(null);
                    }}
                    onSubmitEditing={handleAddIngredient}
                    placeholder="e.g. Niacinamide"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={100}
                    returnKeyType="done"
                    className="h-12 flex-1 rounded-xl border border-[#CBD5E1] px-3 font-publicSansRegular text-base text-[#0F172A]"
                  />
                  <Pressable
                    onPress={handleAddIngredient}
                    accessibilityRole="button"
                    accessibilityLabel="Add ingredient"
                    className="h-12 min-w-[92px] items-center justify-center rounded-xl bg-primary px-3"
                  >
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="add" size={18} color="#FFFFFF" />
                      <Text className="font-publicSansSemiBold text-sm text-white">
                        Add
                      </Text>
                    </View>
                  </Pressable>
                </View>
                {newIngredientNotice ? (
                  <Text className="mt-2 font-publicSansRegular text-sm text-[#B91C1C]">
                    {newIngredientNotice}
                  </Text>
                ) : (
                  <Text className="mt-2 font-publicSansRegular text-xs text-[#64748B]">
                    Changes are saved instantly.
                  </Text>
                )}
              </View>
            </View>

            <PrimaryButton
              text="Analyze Ingredients"
              callBack={() => {
                setShowCategoryList(false);
                Keyboard.dismiss();

                if (!selectedCategory) {
                  showAlert(
                    "Category Required",
                    "Please select a category for this product before proceeding.",
                    [{ text: "OK", style: "default" }],
                    "information-circle-outline",
                    "#2563EB",
                    "#EFF6FF",
                  );
                  return;
                }

                if (extractedIngredients.length <= 2) {
                  showAlert(
                    "More Ingredients Needed",
                    "We need at least 3 ingredients to provide an accurate formulation profile.",
                    [{ text: "Complete List", style: "default" }],
                    "information-circle-outline",
                    "#2563EB",
                    "#EFF6FF",
                  );
                  return;
                }

                router.replace({
                  pathname: "/(scan)/analyzing",
                  params: {
                    mode: "analysis",
                    category: selectedCategory,
                    ingredients: JSON.stringify(extractedIngredients),
                  },
                });
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={alertConfig.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeAlert}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-3xl bg-white p-6 shadow-lg">
            <View className="mb-6 items-center">
              <View
                className="mb-4 h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: alertConfig.iconBg || "#FEF2F2" }}
              >
                <Ionicons
                  name={alertConfig.icon || "alert-circle-outline"}
                  size={24}
                  color={alertConfig.iconColor || "#B91C1C"}
                />
              </View>
              <Text className="text-center font-publicSansBold text-xl text-[#0F172A]">
                {alertConfig.title}
              </Text>
              <Text className="mt-2 text-center font-publicSansRegular text-base text-[#64748B]">
                {alertConfig.message}
              </Text>
            </View>
            <View className="flex-row gap-3">
              {alertConfig.buttons.map((btn, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    closeAlert();
                    btn.onPress?.();
                  }}
                  className={`h-12 flex-1 items-center justify-center rounded-xl ${
                    btn.style === "destructive"
                      ? "bg-[#DC2626]"
                      : btn.style === "cancel"
                        ? "bg-[#F1F5F9]"
                        : "bg-primary"
                  }`}
                >
                  <Text
                    className={`font-publicSansSemiBold text-base ${
                      btn.style === "cancel" ? "text-[#475569]" : "text-white"
                    }`}
                  >
                    {btn.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
