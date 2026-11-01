export interface IThemeConfig {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  buttonRadius: "none" | "xs" | "sm" | "md" | "lg" | "full";
  fontFamily: "Inter" | "Montserrat" | "Open Sans" | "Courier";
  desktopHeadingSize: number; // percentage, e.g. 100 = 100%
  mobileHeadingSize: number;  // percentage, e.g. 100 = 100%
  desktopBodySize: number;    // percentage, e.g. 100 = 100%
  mobileBodySize: number;     // percentage, e.g. 100 = 100%
}

export const initialThemeConfig: IThemeConfig = {
  primaryColor: "#000000",
  accentColor: "#111111",
  backgroundColor: "#ffffff",
  buttonRadius: "xs",
  fontFamily: "Inter",
  desktopHeadingSize: 100,
  mobileHeadingSize: 100,
  desktopBodySize: 100,
  mobileBodySize: 100,
};

