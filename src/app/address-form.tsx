"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { validateAddress } from  "./actions";
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

const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

const schema = z.object({
  postcode: z
    .string()
    .regex(/^\d{4}$/, "Postcode must be exactly 4 digits")
    .refine((val) => parseInt(val, 10) >= 200 && parseInt(val, 10) <= 9999, {
      message: "Postcode must be a valid Australian postcode (200-9999)",
    }),
  suburb: z
    .string()
    .min(2, "Suburb is required")
    .max(100, "Suburb name too long"),
  state: z
    .string()
    .toUpperCase()
    .refine((val) => AU_STATES.includes(val), {
      message: "State must be one of ACT, NSW, NT, QLD, SA, TAS, VIC, WA",
    }),
});

type AddressFormData = z.infer<typeof schema>;

export const AddressForm = () => {
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: AddressFormData) => {
    const message = await validateAddress(
      data.postcode,
      data.suburb,
      data.state
    );
    setValidationResult(message);
    toast({
      title: message,
      status: message.includes("valid") ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
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
              <option value="VIC">VIC</option>
              <option value="NSW">NSW</option>
              <option value="QLD">QLD</option>
              <option value="WA">WA</option>
              <option value="SA">SA</option>
              <option value="TAS">TAS</option>
              <option value="NT">NT</option>
              <option value="ACT">ACT</option>
            </Select>
            <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
          </FormControl>

          {/* Submit Button */}
          <Button type="submit" colorScheme="blue" width="full">
            Validate Address
          </Button>

          {/* Validation Message */}
          {validationResult && (
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
