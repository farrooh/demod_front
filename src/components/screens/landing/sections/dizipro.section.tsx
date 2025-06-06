import { translations } from "@/utils/language";
import { ArrowOutward } from "@mui/icons-material";
import { Grid } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import Buttons from "../../../buttons";
import SimpleTypography from "../../../typography";

export function DiziproSection() {
  return (
    <Grid container width={"100%"}>
      <Grid
        item
        xs={12}
        sm={6}
        md={6}
        lg={6}
        xl={6}
        sx={{
          width: "100%",
          paddingX: "20px",
          gap: "10px",
          borderTopWidth: 1,
          borderBottomWidth: { xs: 0, sm: 1, md: 1, lg: 1, xl: 1 },
          borderLeftWidth: 1,
          borderRightWidth: { xs: 1, sm: 0, md: 0, lg: 0, xl: 0 },
          borderStyle: "solid",
          borderColor: "#E0E0E0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#FAFAFA",
        }}
      >
        <Image
          unoptimized
          src={"/img/build-model-process.png"}
          alt=""
          width={0}
          height={0}
          style={{ width: "90%", height: "100%", objectFit: "contain" }}
        />
      </Grid>
      <Grid
        item
        xs={12}
        sm={6}
        md={6}
        lg={6}
        xl={6}
        sx={{
          padding: {
            xs: "16px 16px",
            sm: "32px 48px",
            md: "32px 48px",
            lg: "32px 48px",
            xl: "32px 48px",
          },
          gap: "20px",
          borderTopWidth: { xs: 0, sm: 1, md: 1, lg: 1, xl: 1 },
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: { xs: 1, sm: 0, md: 0, lg: 0, xl: 0 },
          borderStyle: "solid",
          borderColor: "#E0E0E0",
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <SimpleTypography
          text={translations.ru.title}
          variant={"h2"}
          sx={{
            fontWeight: 500,
            fontSize: {
              xs: "18px",
              sm: "22px",
              md: "22px",
              lg: "22px",
              xl: "22px",
            },
            lineHeight: "26px",
            letterSpacing: "-0.02em",
          }}
        />
        <SimpleTypography
          sx={{
            fontWeight: 400,
            fontSize: {
              xs: "16px",
              sm: "18px",
              md: "18px",
              lg: "18px",
              xl: "18px",
            },
            lineHeight: "26px",
            letterSpacing: "-0.01em",
          }}
          text={translations.ru.description}
          variant={"p"}
        />
        <Link href={"https://dizipro.org"}>
          <Buttons
            name={translations.ru.button}
            className="login__btn"
            sx={{
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <ArrowOutward sx={{ ml: "8px" }} />
          </Buttons>
        </Link>
      </Grid>
    </Grid>
  );
}
