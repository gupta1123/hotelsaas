import React, { useState, useEffect } from "react";
import {
  Box, VStack, HStack, Text, Heading, Button, useColorModeValue, 
  SimpleGrid, FormControl, FormLabel, Input, Select, NumberInput, 
  NumberInputField, NumberInputStepper, NumberIncrementStepper, 
  NumberDecrementStepper, Flex, IconButton, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, 
  ModalBody, ModalCloseButton, Tag, Switch
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, CalendarIcon } from "@chakra-ui/icons";
import { FaUsers, FaMoneyBillWave, FaPercent } from "react-icons/fa";

const Offers = ({ authToken }) => {
  const [offers, setOffers] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [viewMode, setViewMode] = useState("card");
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch(
        "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/offers/getAll",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      } else {
        throw new Error("Failed to fetch offers");
      }
    } catch (error) {
      toast({
        title: "Error fetching offers",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateOffer = () => {
    setEditingOffer(null);
    onOpen();
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    onOpen();
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/offers/delete?id=${offerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.ok) {
        setOffers(offers.filter((offer) => offer.id !== offerId));
        toast({
          title: "Offer deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to delete offer");
      }
    } catch (error) {
      toast({
        title: "Error deleting offer",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const offerData = Object.fromEntries(formData.entries());

    try {
      const url = editingOffer
        ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/offers/edit?id=${editingOffer.id}`
        : "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/offers/create";

      const response = await fetch(url, {
        method: editingOffer ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(offerData),
      });

      if (response.ok) {
        toast({
          title: `Offer ${editingOffer ? "updated" : "created"} successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchOffers();
        onClose();
      } else {
        throw new Error(`Failed to ${editingOffer ? "update" : "create"} offer`);
      }
    } catch (error) {
      toast({
        title: `Error ${editingOffer ? "updating" : "creating"} offer`,
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const OfferCard = ({ offer }) => (
    <Box
      bg={bgColor}
      p={5}
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading size="md" color={textColor}>
          {offer.code}
        </Heading>
        <Tag colorScheme="green" size="lg">
          ₹{offer.discountAmount || 0} off
        </Tag>
      </Flex>
      <VStack align="stretch" spacing={3}>
        <HStack>
          <CalendarIcon />
          <Text color={textColor}>
            {offer.startBookingPeriod} - {offer.endBookingPeriod}
          </Text>
        </HStack>
        <HStack>
          <CalendarIcon />
          <Text color={textColor}>{offer.applicableRoomType || "All rooms"}</Text>
        </HStack>
        <HStack>
          <FaUsers />
          <Text color={textColor}>
            {offer.minimumNumberOfGuests} - {offer.maximumNumberOfGuests} guests
          </Text>
        </HStack>
        <HStack>
          <FaMoneyBillWave />
          <Text color={textColor}>
            ₹{offer.minimumBookingAmount} - ₹{offer.maximumBookingAmount}
          </Text>
        </HStack>
        <HStack>
          <FaPercent />
          <Text color={textColor}>{offer.discountPercentage}% off</Text>
        </HStack>
      </VStack>
      <Flex mt={4} justifyContent="flex-end">
        <IconButton
          icon={<EditIcon />}
          aria-label="Edit offer"
          mr={2}
          onClick={() => handleEditOffer(offer)}
        />
        <IconButton
          icon={<DeleteIcon />}
          aria-label="Delete offer"
          colorScheme="red"
          onClick={() => handleDeleteOffer(offer.id)}
        />
      </Flex>
    </Box>
  );

  return (
    <Box p={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={5}>
        <Heading size="xl">Offers</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreateOffer}>
          Create New Offer
        </Button>
      </Flex>

      <Flex justifyContent="flex-end" mb={4}>
        <Switch
          isChecked={viewMode === "card"}
          onChange={() => setViewMode(viewMode === "card" ? "table" : "card")}
        />
        <Text ml={2}>{viewMode === "card" ? "Card View" : "Table View"}</Text>
      </Flex>

      {viewMode === "card" ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </SimpleGrid>
      ) : (
        <Box overflowX="auto">
          {/* Implement table view here */}
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingOffer ? "Edit Offer" : "Create New Offer"}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Offer Code</FormLabel>
                  <Input name="code" defaultValue={editingOffer?.code} />
                </FormControl>
                <FormControl>
                  <FormLabel>Room Types</FormLabel>
                  <Select name="applicableRoomType" defaultValue={editingOffer?.applicableRoomType}>
                    <option value="AC">AC</option>
                    <option value="Non AC">Non AC</option>
                    <option value="Deluxe">Deluxe</option>
                  </Select>
                </FormControl>
                <HStack>
                  <FormControl>
                    <FormLabel>Min Duration (days)</FormLabel>
                    <NumberInput min={1} defaultValue={editingOffer?.minimumBookingDurationInDays || 1}>
                      <NumberInputField name="minimumBookingDurationInDays" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Max Duration (days)</FormLabel>
                    <NumberInput min={1} defaultValue={editingOffer?.maximumBookingDurationInDays || 1}>
                      <NumberInputField name="maximumBookingDurationInDays" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                {/* Add more form fields here */}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} type="submit">
                {editingOffer ? "Update" : "Create"}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Offers;