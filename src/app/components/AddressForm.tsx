"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useValidateAddress } from "../hooks/useValidateAddress";
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

export const AU_STATES: Record<string, string> = {
  ACT: "Australian Capital Territory",
  NSW: "New South Wales",
  NT: "Northern Territory",
  QLD: "Queensland",
  SA: "South Australia",
  TAS: "Tasmania",
  VIC: "Victoria",
  WA: "Western Australia",
};

const schema = z.object({
  postcode: z
    .string()
    .regex(/^\d{4}$/, "Postcode must be exactly 4 digits")
    .refine((val) => parseInt(val, 10) >= 200 && parseInt(val, 10) <= 9999, {
      message: "Postcode must be a valid Australian postcode (0200-9999)",
    }),
  suburb: z
    .string()
    .min(2, "Suburb is required")
    .max(100, "Suburb name too long"),
  state: z
    .string()
    .toUpperCase()
    .refine((val) => Object.keys(AU_STATES).includes(val), {
      message: `State must be one of ${Object.keys(AU_STATES).join(", ")}`,
    }),
});

type AddressFormData = z.infer<typeof schema>;

const AddressForm = () => {
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [validateAddress, { loading }] = useValidateAddress();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (formData: AddressFormData) => {
    try {
      const { data, error } = await validateAddress({ variables: formData });
  
      if (error) {
        console.error("GraphQL Error:", error);
        throw new Error(error.message || "GraphQL request failed.");
      }
  
      if (!data?.validateAddress) {
        throw new Error("Invalid API response.");
      }
  
      const { isValid, message } = data.validateAddress;
  
      setValidationResult(message);
      toast({
        title: "Validation Result",
        description: message,
        status: isValid ? "success" : "error",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      let errorMessage = "An unexpected error occurred.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      console.error("Validation Error:", err);
      setValidationResult(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  

  return (
    <Box
      p={6}
      maxW="400px"
      mx="auto"
      mt={8}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          {/* Postcode Input*/}
          <FormControl isInvalid={!!errors.postcode}>
            <FormLabel>Postcode</FormLabel>
            <Input {...register("postcode")} placeholder="Enter postcode" />
            <FormErrorMessage>{errors.postcode?.message}</FormErrorMessage>
          </FormControl>
          {/* Suburb Input*/}
          <FormControl isInvalid={!!errors.suburb}>
            <FormLabel>Suburb</FormLabel>
            <Input {...register("suburb")} placeholder="Enter suburb" />
            <FormErrorMessage>{errors.suburb?.message}</FormErrorMessage>
          </FormControl>
          {/* State Input*/}
          <FormControl isInvalid={!!errors.state}>
            <FormLabel>State</FormLabel>
            <Select {...register("state")} placeholder="Select State">
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
            disabled={loading}
          >
            Validate Address
          </Button>
          {/* Validation Message */}
          {validationResult && !loading && (
            <Text
              color={
                validationResult.includes("valid") ? "green.500" : "red.500"
              }
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
