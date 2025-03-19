import React, { useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "./ThemedText";
import { Divider } from "./ui/divider";
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "./ui/checkbox";
import { VStack } from "./ui/vstack";
import { Button, ButtonText } from "./ui/button";
import { CheckIcon } from "./ui/icon";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSection {
  title: string;
  options: FilterOption[];
  values: string[];
  onChange: (values: string[]) => void;
}

interface FilterMenuProps {
  menuTitle: string;
  filterSections: FilterSection[];
  onResetFilters: () => void;
  onApplyFilters: () => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  menuTitle,
  filterSections,
  onResetFilters,
  onApplyFilters,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <>
      <TouchableOpacity onPress={openMenu}>
        <Ionicons name="filter" size={24} color={Colors.light.tabIconDefault} />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-start",
              alignItems: "flex-end",
            }}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={{
                  width: 300,
                  maxHeight: "80%",
                  backgroundColor: "white",
                  borderRadius: 10,
                  marginTop: 60,
                  marginRight: 15,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                {/* Header */}
                <View
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#e5e5e5",
                  }}
                >
                  <ThemedText className="text-lg font-bold">
                    {menuTitle}
                  </ThemedText>
                </View>

                {/* Content - Sections and Checkboxes */}
                <View style={{ padding: 15 }}>
                  {/* Your filter sections go here */}
                  {filterSections.map(
                    (section: FilterSection, index: number) => (
                      <React.Fragment key={section.title}>
                        {index > 0 && <Divider />}
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                            {section.title}
                          </Text>
                          <CheckboxGroup
                            value={section.values}
                            onChange={section.onChange}
                          >
                            <VStack space="sm">
                              {section.options.map((option: FilterOption) => (
                                <Checkbox
                                  key={option.value}
                                  value={option.value}
                                >
                                  <CheckboxIndicator>
                                    <CheckboxIcon as={CheckIcon} />
                                  </CheckboxIndicator>
                                  <CheckboxLabel>{option.label}</CheckboxLabel>
                                </Checkbox>
                              ))}
                            </VStack>
                          </CheckboxGroup>
                        </View>
                      </React.Fragment>
                    ),
                  )}
                </View>

                {/* Footer with Buttons */}
                <View
                  style={{
                    padding: 15,
                    borderTopWidth: 1,
                    borderTopColor: "#e5e5e5",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    variant="outline"
                    onPress={() => {
                      onResetFilters();
                      closeMenu();
                    }}
                  >
                    <ButtonText>Reset</ButtonText>
                  </Button>
                  <Button
                    onPress={() => {
                      onApplyFilters();
                      closeMenu();
                    }}
                  >
                    <ButtonText>Apply</ButtonText>
                  </Button>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default FilterMenu;
