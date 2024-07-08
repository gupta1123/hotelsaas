import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Input,
    Button,
    Flex,
    Text,
    useColorModeValue,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    IconButton,
    Skeleton,
    SkeletonText,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import ClearPaymentComponent from './ClearPaymentComponent';

const Ledgers = ({ authToken }) => {
    const [singleData, setSingleData] = useState([]);
    const [groupData, setGroupData] = useState([]);
    const [filteredSingleData, setFilteredSingleData] = useState([]);
    const [filteredGroupData, setFilteredGroupData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [isClearPaymentModalOpen, setIsClearPaymentModalOpen] = useState(false);
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const headerBgColor = useColorModeValue('gray.100', 'gray.700');

    useEffect(() => {
        fetchData();
    }, [authToken]);

    useEffect(() => {
        handleSearch();
    }, [searchText, singleData, groupData]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const singleResponse = await axios.get('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getPendingBills', {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            const groupResponse = await axios.get('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getPendingBillsForGroup', {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            const aggregatedSingleData = aggregateData(singleResponse.data, false);
            const aggregatedGroupData = aggregateData(groupResponse.data, true);

            setSingleData(aggregatedSingleData);
            setGroupData(aggregatedGroupData);
            setFilteredSingleData(aggregatedSingleData);
            setFilteredGroupData(aggregatedGroupData);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
        setIsLoading(false);
    };

    const handleSearch = () => {
        const filterData = (data) => {
            return data.filter((item) => {
                const searchStr = searchText.toLowerCase();
                return (
                    item.customerName.toLowerCase().includes(searchStr) ||
                    (item.phone && item.phone.toString().includes(searchStr)) ||
                    (item.bookings && item.bookings.some(booking => booking.bookingId.toString().includes(searchStr))) ||
                    (item.groupIds && item.groupIds.some(groupId => groupId.toString().includes(searchStr)))
                );
            });
        };

        setFilteredSingleData(filterData(singleData));
        setFilteredGroupData(filterData(groupData));
    };

    const renderSkeleton = () => (
        <Tr>
            <Td><Skeleton height="20px" /></Td>
            <Td><Skeleton height="20px" /></Td>
            <Td><SkeletonText mt="4" noOfLines={1} spacing="4" /></Td>
            <Td><Skeleton height="20px" /></Td>
            <Td><Skeleton height="20px" /></Td>
        </Tr>
    );

    const capitalizeFirstLetter = (string) => {
        return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const aggregateData = (data, isGroup) => {
        const aggregated = {};
    
        data.forEach((item) => {
            const key = isGroup ? item.groupId : item.customerName;
            if (aggregated[key]) {
                aggregated[key].totalPendingAmount += item.pendingAmt;
                isGroup ? aggregated[key].groupIds.push(item.groupId) : aggregated[key].bookings.push(item);
            } else {
                aggregated[key] = {
                    customerName: capitalizeFirstLetter(item.customerName),
                    phone: item.phone,
                    totalPendingAmount: item.pendingAmt,
                    ...(isGroup ? { groupIds: [item.groupId] } : { bookings: [item] }),
                };
            }
        });
    
        // Filter out entries with total pending amounts that round to zero
        return Object.values(aggregated).filter(item => Math.round(item.totalPendingAmount) !== 0);
    };
    


    const renderPendingAmount = (amount) => {
        const roundedAmount = Math.round(parseFloat(amount) || 0);
        const isPositive = roundedAmount > 0;
        return (
            <Text color={isPositive ? 'red.500' : 'green.500'} fontWeight="bold">
                {isPositive ? '+' : '-'} ₹{Math.abs(roundedAmount)}
            </Text>
        );
    };

    const handleClearClick = (record) => {
        setSelectedBooking(record);
        setIsClearPaymentModalOpen(true);
    };

    const handleClearPaymentModalClose = () => {
        setIsClearPaymentModalOpen(false);
        setSelectedBooking(null);
    };

    const handlePaymentCleared = (clearedBooking, isGroup) => {
        if (!clearedBooking || typeof clearedBooking !== 'object') {
            console.error('Invalid clearedBooking data:', clearedBooking);
            toast({
                title: "Error",
                description: "Invalid payment data received.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
    
        const { customerName, amountCleared } = clearedBooking;
    
        if (!customerName || typeof amountCleared !== 'number') {
            console.error('Missing required properties in clearedBooking:', clearedBooking);
            toast({
                title: "Error",
                description: "Incomplete payment data received.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
    
        const updateData = (prevData) => {
            return prevData.map(item => {
                if (item.customerName === customerName) {
                    const updatedItem = { ...item };
                    updatedItem.totalPendingAmount -= amountCleared;
                    if (Math.round(updatedItem.totalPendingAmount) === 0) {
                        return null; // Remove the entry if total becomes zero
                    }
                    return updatedItem;
                }
                return item;
            }).filter(Boolean); // Remove null entries
        };
    
        if (isGroup) {
            setGroupData(prevData => updateData(prevData));
            setFilteredGroupData(prevData => updateData(prevData));
        } else {
            setSingleData(prevData => updateData(prevData));
            setFilteredSingleData(prevData => updateData(prevData));
        }
    
        toast({
            title: "Payment Cleared",
            description: `Payment of ₹${amountCleared} cleared for ${customerName}.`,
            status: "success",
            duration: 5000,
            isClosable: true,
        });
    };
    



    const renderBookingPopover = (bookings, isGroup) => (
        <Popover>
            <PopoverTrigger>
                <Button size="sm">{bookings.length}</Button>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Booking Details</PopoverHeader>
                <PopoverBody>
                    {bookings.map((booking, index) => (
                        <Flex key={index} justifyContent="space-between" alignItems="center" mb={2}>
                            <Text>{isGroup ? `Group ${booking}` : `Booking ${booking.bookingId}`}</Text>
                            <Text>{renderPendingAmount(isGroup ? 0 : booking.pendingAmt)}</Text>
                        </Flex>
                    ))}
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );

    const renderTable = (data, isGroup) => {
        const indexOfLastRow = currentPage * rowsPerPage;
        const indexOfFirstRow = indexOfLastRow - rowsPerPage;
        const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

        return (
            <Box overflowX="auto">
                <Table variant="simple">
                    <Thead bg={headerBgColor}>
                        <Tr>
                            <Th>Customer Name</Th>
                            <Th>Phone</Th>
                            <Th>Pending Amount</Th>
                            <Th>{isGroup ? "Group Count" : "Booking Count"}</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {isLoading ? (
                            Array.from({ length: rowsPerPage }, (_, index) => renderSkeleton(index))
                        ) : (
                            currentRows.map((record, index) => (
                                <Tr key={index}>
                                    <Td>{record.customerName}</Td>
                                    <Td>{record.phone}</Td>
                                    <Td>{renderPendingAmount(record.totalPendingAmount)}</Td>
                                    <Td>
                                        {renderBookingPopover(isGroup ? record.groupIds : record.bookings, isGroup)}
                                    </Td>
                                    <Td>
                                        <Button colorScheme="blue" size="sm" onClick={() => handleClearClick(record)}>
                                            Clear Payment
                                        </Button>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </Box>
        );
    };

    const totalPages = (data) => Math.ceil(data.length / rowsPerPage);

    const Pagination = ({ data }) => (
        <Flex justifyContent="space-between" mt={4} alignItems="center">
            <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                Previous
            </Button>
            <Text>Page {currentPage} of {totalPages(data)}</Text>
            <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages(data)))} disabled={currentPage === totalPages(data)}>
                Next
            </Button>
        </Flex>
    );

    return (
        <Box p={5} bg={bgColor} borderRadius="lg" boxShadow="md">
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Text fontSize="2xl" fontWeight="bold">Ledgers</Text>
                <Flex>
                    <Input
                        placeholder="Search by name, phone, booking or group ID..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        mr={2}
                        width="300px"
                    />
                    <IconButton aria-label="Search" icon={<SearchIcon />} onClick={handleSearch} />
                </Flex>
            </Flex>

            <Tabs isFitted variant="enclosed">
                <TabList mb="1em">
                    <Tab>Single Bookings</Tab>
                    <Tab>Group Bookings</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        {renderTable(filteredSingleData, false)}
                        <Pagination data={filteredSingleData} />
                    </TabPanel>
                    <TabPanel>
                        {renderTable(filteredGroupData, true)}
                        <Pagination data={filteredGroupData} />
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {isClearPaymentModalOpen && selectedBooking && (
                <ClearPaymentComponent
                    selectedBooking={selectedBooking}
                    authToken={authToken}
                    onClose={handleClearPaymentModalClose}
                    onPaymentCleared={(clearedBooking) => handlePaymentCleared(clearedBooking, selectedBooking.groupIds !== undefined)}
                />
            )}
        </Box>
    );
};

export default Ledgers;