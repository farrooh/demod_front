import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Box, ListItem } from '@mui/material';
import SimpleTypography from '../typography';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { setCategoryFilter, setCategoryNameFilter, setColorFilter, setStyleFilter } from '../../data/handle_filters';
import { getAllModels } from '../../data/get_all_models';

interface breadCrumbProps {
  route?: string | undefined,
  style?: string | undefined,
  direction?: string,
  category?: string,
  model_name?: string,
  breadCrumbsData?: any
}
export default function IconBreadcrumbs(props: breadCrumbProps) {
  const router = useRouter()
  const dispatch = useDispatch<any>()
  const handleGoBack = () => {

    dispatch(getAllModels({
      category_id: [],
      color_id: [],
      style_id: [],
      page: 1,
    }))

    dispatch(setStyleFilter({ snex: [] }))
    dispatch(setColorFilter({ cnex: [] }))
    dispatch(setCategoryFilter({ knex: [] }))
  }

  return (
    <Box
      sx={{
        maxWidth: "1200px",
        margin: "0 auto",
        alignItems: "center",
      }}
      className='products__breadcrumb'
    >

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ marginRight: "10px" }} onClick={handleGoBack}>
          <Link href="/">
            <a style={{ display: "flex", alignItems: "center", textDecoration: "none" }} >
              <Image
                alt="Go back"
                src="/icons/go-back.svg"
                width={5}
                height={9}
              />
              <SimpleTypography
                className='back__text'
                text='Go back'
              />
            </a>

          </Link>
        </Box>

        <Box sx={{ marginRight: "10px", cursor: "pointer" }}
          onClick={() => {
            dispatch(setCategoryNameFilter({ knnex: props?.breadCrumbsData?.category?.parent_name }));
            dispatch(setCategoryFilter({ knex: [props?.breadCrumbsData?.category?.id] }));
            router.push(`${props?.route}/?category=${props?.breadCrumbsData?.category?.id}&category_name=${props?.breadCrumbsData?.category?.parent_name}`);
          }}
        >
          <Box>
            <a style={{ display: "flex", textDecoration: "none" }}>
              <SimpleTypography
                className='breadcumb__text'
                text={props?.breadCrumbsData?.category?.parent_name} />
              <Image
                src="/icons/breadcrumb-arrow.svg"
                alt="Breadcrumd arrow"
                width={5}
                height={9}
              />
            </a>
          </Box>
        </Box>

        <Box sx={{ marginRight: "10px", cursor: "pointer" }}
          onClick={() => {
            dispatch(setCategoryNameFilter(
              { knnex: props?.breadCrumbsData?.category?.parent_name }
            ));
            dispatch(setCategoryFilter(
              { knex: [props?.breadCrumbsData?.category?.id] }
            ));
            router.push(`${props?.route}/?category=${props?.breadCrumbsData?.category?.id}&category_name=${props?.breadCrumbsData?.category?.parent_name}`);

          }}>
          <Box>
            <a style={{ display: "flex", textDecoration: "none" }}>
              <SimpleTypography
                className='breadcumb__text'
                text={props?.breadCrumbsData?.category?.name} />
            </a>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
