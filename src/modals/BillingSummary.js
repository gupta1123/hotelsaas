
import React from 'react';
import { Box, VStack, Text, Divider, HStack, useColorModeValue, Flex, Icon, Badge } from '@chakra-ui/react';
import { FaBed, FaPlus, FaUtensils, FaPercent, FaMoneyBillWave, FaWallet, FaReceipt } from 'react-icons/fa';
import { MdLocalOffer } from 'react-icons/md';

const BillingSummary = ({ billingSummary }) => {
    const bgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.700', 'white');
    const accentColor = useColorModeValue('blue.500', 'blue.300');

    const BillingItem = ({ icon, label, amount, isNegative = false }) => (
        <HStack justifyContent="space-between" w="100%">
            <HStack>
                <Icon as={icon} color={accentColor} />
                <Text color={textColor}>{label}</Text>
            </HStack>
            <Text color={textColor} textAlign="right" fontWeight="medium">
                {isNegative && amount !== 0 ? '-' : ''}₹{Math.round(amount)}
            </Text>
        </HStack>
    );

    return (
        <Box bg={bgColor} borderRadius="lg" p={6} boxShadow="lg" w="100%" maxW="500px">
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                    Billing Summary
                </Text>
                <Badge colorScheme={billingSummary.amountPending > 0 ? "yellow" : "green"}>
                    {billingSummary.amountPending > 0 ? "Pending" : "Paid"}
                </Badge>
            </Flex>
            <VStack spacing={3} align="stretch">
                <BillingItem icon={FaBed} label="Room Charges" amount={billingSummary.roomCharges} />
                <BillingItem icon={FaPlus} label="Add-on Charges" amount={billingSummary.addOnCharges} />
                <BillingItem icon={FaUtensils} label="Food Bill" amount={billingSummary.foodBill} />
                <BillingItem icon={FaPercent} label="Discount" amount={billingSummary.discount} isNegative={true} />
                <BillingItem icon={MdLocalOffer} label="Offer Discount" amount={billingSummary.offerDiscount} isNegative={true} />
                <Divider my={3} />
                <BillingItem icon={FaMoneyBillWave} label="Subtotal" amount={billingSummary.subtotal} />
                <BillingItem icon={FaReceipt} label="GST Amount" amount={billingSummary.gstAmount} />
                <HStack justifyContent="space-between" w="100%">
                    <Text fontWeight="bold" color={textColor}>Gross Amount</Text>
                    <Text fontWeight="bold" color={accentColor} fontSize="lg">₹{Math.round(billingSummary.grossAmount)}</Text>
                </HStack>
                <Divider my={3} />
                <BillingItem icon={FaMoneyBillWave} label="Amount Paid" amount={billingSummary.amountPaid} />
                <BillingItem icon={FaWallet} label="Amount Pending" amount={billingSummary.amountPending} />
            </VStack>
        </Box>
    );
};

export default BillingSummary;