"use client"
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Image from 'next/image'
import { Box, SxProps } from '@mui/system';
import Buttons from '../buttons';
import { Icon } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

type InputProps = {
  placeHolder: string,
  component?: any,
  className?: string,
  startIcon?: boolean,
  clic?: any,
  value?: string;
  sx?: SxProps,
  onChange?: (value: string) => void,
  search?: (searchValue: string) => void | any,
  searchDelay?: number,
  withButton?: boolean,
  noAutoSearch?: boolean,
};


export default function SearchInput(props: InputProps) {

  const [searchTerm, setSearchTerm] = useState('')
  const [searchInit, setSearchInit] = useState(false)

  useMemo(() => {
    if (props?.search && searchInit && !props?.withButton && !props?.noAutoSearch) {
      const delayDebounceFn = setTimeout(() => {
        props?.search ? props?.search(searchTerm) : null
      }, 10)

      return () => clearTimeout(delayDebounceFn)
    }
  }, [searchTerm, searchInit])

  return (
    <Box
      sx={{
        backgroundColor: '#FAFAFA',
        border: '1px solid #424242',
        borderRadius: '4px',
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: '22px',
        color: '#848484',
        padding: '7px 12px',
        display: 'flex',
        alignItems: 'center',
        width: 280,
        position: 'relative',
        ...props?.sx,
      }}
    >
      {
        props?.startIcon ?
          <IconButton disabled sx={{ p: 0, mr: '8px' }} aria-label="menu">
            <Image
              src="/icons/search-icon.svg"
              alt='Search icon'
              width={20}
              height={20}
            ></Image>
          </IconButton>
          : null
      }
      <InputBase
        sx={{ flex: 1, padding: 0, fontSize: '16px' }}
        placeholder={props?.placeHolder}
        onChange={(e) => {
          if (!props?.withButton && !props?.noAutoSearch) {
            clearTimeout('setTermTimeout')
            const setTermTimeout = setTimeout(() => {
              setSearchInit(true)
              setSearchTerm(e.target.value)
            }, props?.searchDelay || 1000)
          }
          else if (!!props?.onChange) {
            props.onChange(e.target.value)
          }
        }}
        inputProps={{
          'style': { padding: '0', fontSize: '16px' }
        }}
      />
      {
        props?.withButton ?
          <Buttons
            sx={{
              p: "7px 12px !important",
            }}
            name='Поиск'
            className='search__btn'
            type="button"
            aria-label="search"
          />
          : null
      }
    </Box >
  )
}