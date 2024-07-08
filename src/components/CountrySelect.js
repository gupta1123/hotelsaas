import React from 'react';
import Select from 'react-select';
import { getData } from 'country-list';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';

const CountrySelect = ({ value, onChange }) => {
  const { colorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const focusBorderColor = useColorModeValue('blue.500', 'blue.300');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');

  const countries = getData().map(country => ({
    label: country.name,
    value: country.code
  }));

  const selectedOption = countries.find(option => option.label === value);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: bgColor,
      color: textColor,
      border: state.isFocused ? `1px solid ${focusBorderColor}` : `1px solid ${borderColor}`,
      borderRadius: '4px',
      boxShadow: 'none',
      width: '100%',
      '&:hover': {
        border: state.isFocused ? `1px solid ${focusBorderColor}` : `1px solid ${borderColor}`,
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: bgColor,
      width: '100%',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? hoverBgColor : bgColor,
      color: textColor,
      '&:hover': {
        backgroundColor: hoverBgColor,
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: textColor,
    }),
    input: (provided) => ({
      ...provided,
      color: textColor,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: placeholderColor,
    }),
  };

  return (
    <Select
      options={countries}
      value={selectedOption}
      onChange={onChange}
      placeholder="Search countries..."
      isClearable={true}
      isSearchable={true}
      styles={customStyles}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: hoverBgColor,
          primary: focusBorderColor,
        },
      })}
    />
  );
};

export default CountrySelect;