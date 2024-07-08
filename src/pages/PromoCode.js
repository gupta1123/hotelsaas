import React, { useState, useEffect } from 'react';
import { Button, message, Select, Typography ,Tag } from 'antd';
import './PromoCode.css';
import moment from 'moment';

const { Text } = Typography;
const { Option } = Select;

const PromoCode = ({ authToken, checkInDate,  setSelectedOfferId, selectedOfferId ,checkOutDate, adults, children, selectedRoomType, totalRoomCharges }) => {
    const [promoCode, setPromoCode] = useState('');
    const [isApplied, setIsApplied] = useState(false);
    const [isValid, setIsValid] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [offers, setOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    useEffect(() => {
        fetchOffers();
    }, [authToken]);

    const fetchOffers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/offers/getAll",
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching offers:', errorData);
                message.error(`Failed to fetch offers. Status: ${response.status} - ${response.statusText}`);
            } else {
                const data = await response.json();
                setOffers(data);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            message.error('Failed to fetch offers. Please check the console for more details.');
        }
        setIsLoading(false);
    };

    const handleApplyPromoCode = () => {
        if (selectedOffer) {
          const { id, discountAmount } = selectedOffer;
      
          setIsApplied(true);
          setIsValid(true);
          setDiscountAmount(discountAmount);
          setSelectedOfferId(id);
          message.success('Promo code applied successfully!');
        } else {
          setIsValid(false);
          setSelectedOfferId(null);
          message.error('Please select a valid promo code.');
        }
      };

    const calculateBookingDuration = () => {
        const checkInMoment = moment(checkInDate, "YYYY-MM-DD");
        const checkOutMoment = moment(checkOutDate, "YYYY-MM-DD");
        return checkOutMoment.diff(checkInMoment, 'days');
    };

    const handleOfferChange = (offerId) => {
        if (offerId) {
          const offer = offers.find((offer) => offer.id === offerId);
          setSelectedOffer(offer);
          setPromoCode(offer.code);
          setSelectedOfferId(offerId); // Set the selected offer ID using the prop function
        } else {
          setSelectedOffer(null);
          setPromoCode('');
          setIsApplied(false);
          setIsValid(null);
          setDiscountAmount(0);
          setSelectedOfferId(null); // Clear the selected offer ID using the prop function
        }
      };

      return (
        <div className="promo-code-container">
          <Text strong style={{ fontSize: '18px' }}>Promo Code</Text>
          <div className="promo-code-input-container">
            <Select
              showSearch
              placeholder="Select a promo code"
              optionFilterProp="children"
              onChange={handleOfferChange}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              loading={isLoading}
              allowClear
              style={{ width: '200px' }}
              className="promo-code-select"
              value={selectedOffer ? selectedOffer.id : undefined} // Set the selected value to the offer ID
            >
              {offers && offers.map((offer) => (
                <Option key={offer.id} value={offer.id}>
                  {offer.code}
                </Option>
              ))}
            </Select>
            <Button type="primary" onClick={handleApplyPromoCode} disabled={isApplied || !selectedOffer} className="apply-button">
              {isApplied ? 'Applied' : 'Apply'}
            </Button>
            {isApplied && (
              <Tag color="green" style={{ marginLeft: '8px' }}>
                Promo code applied
              </Tag>
            )}
          </div>
          {isApplied && isValid && (
            <div className="promo-code-success">
              <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>Promo code applied successfully!</Text>
              <Text strong className="discount-amount" style={{ fontSize: '16px', marginLeft: '8px' }}>Discount: ₹{discountAmount}</Text>
            </div>
          )}
          {isApplied && !isValid && (
            <div className="promo-code-error">
              <Text style={{ fontSize: '16px', color: '#ff4d4f' }}>Invalid promo code. Please select a valid code.</Text>
            </div>
          )}
        </div>
      );
          }

export default PromoCode;
