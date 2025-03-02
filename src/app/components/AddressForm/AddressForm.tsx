"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useValidateAddress } from "../../graphql/client/useValidateAddress";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { addressSchema } from "../../constants/validationSchema";
import { AU_STATES, UI_TEXT } from "../../constants/constants";
import ClientOnlyMap from "../Map/ClientOnlyMap";
import { getStateAbbreviation } from "../../utils/functions";

type AddressFormData = z.infer<typeof addressSchema>;

const AddressForm = () => {
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [validateAddress, { loading }] = useValidateAddress();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const handleValidationResult = (message: string, isValid: boolean) => {
    setValidationResult(message);
    toast({
      title: UI_TEXT.messages.validationResult,
      description: message,
      status: isValid ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
  };

  const onSubmit = async (formData: AddressFormData) => {
    try {
      const { data } = await validateAddress({ variables: formData });
      handleValidationResult(
        data.validateAddress.message,
        data.validateAddress.isValid
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : String(err || "An unexpected error occurred.");
      console.error("Validation Error:", err);
      handleValidationResult(errorMessage, false);
    }
  };

  const validationColor = validationResult?.includes("valid")
    ? "green.500"
    : "red.500";

  const handleLocationSelect = (
    postcode: string,
    suburb: string,
    state: string
  ) => {
    setValue("postcode", postcode);
    setValue("suburb", suburb);
    setValue("state", getStateAbbreviation(state) || "");
  };

  return (
    <Box
      p={6}
      maxW="500px"
      mx="auto"
      mt={2}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          {/* Map */}
          <Box position="relative">
            <ClientOnlyMap onLocationSelect={handleLocationSelect} />
            <Text fontSize="sm" color="gray.500" mb={2}>
              {UI_TEXT.mapHint}
            </Text>
          </Box>
          {/* Postcode Input*/}
          <FormControl isInvalid={!!errors.postcode}>
            <FormLabel htmlFor="postcode">
              {UI_TEXT.formLabels.postcode}
            </FormLabel>
            <Input
              id="postcode"
              {...register("postcode")}
              placeholder={UI_TEXT.placeholders.postcode}
              data-testid="postcode-input"
              aria-label={`Enter your postcode. Example: 2000 for Sydney.`}
            />
            <FormErrorMessage>{errors.postcode?.message}</FormErrorMessage>
          </FormControl>
          {/* Suburb Input*/}
          <FormControl isInvalid={!!errors.suburb}>
            <FormLabel htmlFor="suburb">{UI_TEXT.formLabels.suburb}</FormLabel>
            <Input
              id="suburb"
              {...register("suburb")}
              placeholder={UI_TEXT.placeholders.suburb}
              data-testid="suburb-input"
              aria-label={`Enter your suburb name. Example: Melbourne, Brisbane, Perth.`}
            />
            <FormErrorMessage>{errors.suburb?.message}</FormErrorMessage>
          </FormControl>
          {/* State Input*/}
          <FormControl isInvalid={!!errors.state}>
            <FormLabel htmlFor="state">{UI_TEXT.formLabels.state}</FormLabel>
            <Select
              id="state"
              {...register("state")}
              placeholder={UI_TEXT.placeholders.state}
              aria-label={`Select your state from the list. Available states include ${Object.entries(
                AU_STATES
              )
                .map(([abbr, fullName]) => `${fullName} (${abbr})`)
                .join(", ")}.`}
              data-testid="state-select"
            >
              {Object.entries(AU_STATES).map(([abbr]) => (
                <option key={abbr} value={abbr}>
                  {abbr}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
          </FormControl>
          {/* Submit Button */}
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={loading}
            loadingText={UI_TEXT.button.validating}
            data-testid="submit-button"
            aria-label="Submit the form to validate your address"
          >
            {UI_TEXT.button.validate}
          </Button>
          {/* Validation Message */}
          {validationResult && !loading && (
            <Text
              aria-live="assertive"
              color={validationColor}
              data-testid="validation-message"
              aria-label={`Address validation result: ${validationResult}`}
              tabIndex={0}
            >
              {validationResult}
            </Text>
          )}
        </VStack>
      </form>
    </Box>
  );
};

export default AddressForm;
