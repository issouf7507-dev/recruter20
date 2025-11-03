import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div>
      <footer className="bg-[#a590ff] py-12 md:pt-16 text-white">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <div className="flex flex-col justify-between gap-x-8 gap-y-12 lg:flex-row">
            <div className="flex flex-col gap-8 md:items-start">
              <div className="flex w-full flex-col gap-6 md:max-w-xs md:gap-8">
                <div className="flex h-8 w-max items-center justify-start overflow-visible dark-mode">
                  <svg
                    viewBox="0 0 38 38"
                    fill="none"
                    className="size-8 origin-center scale-[1.2] aspect-square h-full w-auto shrink-0"
                  >
                    <g filter="url(#filter0-_R_5apbsnpfiv7b_">
                      <g clipPath="url(#clip0-_R_5apbsnpfiv7b_">
                        <path
                          d="M3 14.8C3 10.3196 3 8.07937 3.87195 6.36808C4.63893 4.86278 5.86278 3.63893 7.36808 2.87195C9.07937 2 11.3196 2 15.8 2H22.2C26.6804 2 28.9206 2 30.6319 2.87195C32.1372 3.63893 33.3611 4.86278 34.1281 6.36808C35 8.07937 35 10.3196 35 14.8V21.2C35 25.6804 35 27.9206 34.1281 29.6319C33.3611 31.1372 32.1372 32.3611 30.6319 33.1281C28.9206 34 26.6804 34 22.2 34H15.8C11.3196 34 9.07937 34 7.36808 33.1281C5.86278 32.3611 4.63893 31.1372 3.87195 29.6319C3 27.9206 3 25.6804 3 21.2V14.8Z"
                          fill="white"
                        ></path>
                        <path
                          d="M3 14.8C3 10.3196 3 8.07937 3.87195 6.36808C4.63893 4.86278 5.86278 3.63893 7.36808 2.87195C9.07937 2 11.3196 2 15.8 2H22.2C26.6804 2 28.9206 2 30.6319 2.87195C32.1372 3.63893 33.3611 4.86278 34.1281 6.36808C35 8.07937 35 10.3196 35 14.8V21.2C35 25.6804 35 27.9206 34.1281 29.6319C33.3611 31.1372 32.1372 32.3611 30.6319 33.1281C28.9206 34 26.6804 34 22.2 34H15.8C11.3196 34 9.07937 34 7.36808 33.1281C5.86278 32.3611 4.63893 31.1372 3.87195 29.6319C3 27.9206 3 25.6804 3 21.2V14.8Z"
                          fill="url(#paint0_linear-_R_5apbsnpfiv7b_"
                          fillOpacity="0.2"
                        ></path>
                        <g
                          opacity="0.14"
                          clipPath="url(#clip1-_R_5apbsnpfiv7b_"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18.9612 2H19.0388V3.96123C20.8929 3.96625 22.6625 4.33069 24.2816 4.98855V2H24.3592V5.02038C25.7339 5.58859 26.9986 6.36882 28.1126 7.32031H29.602V2H29.6796V7.32031H35V7.39798H29.6796V8.88728C30.6311 10.0013 31.4113 11.266 31.9796 12.6406H35V12.7183H32.0114C32.6693 14.3373 33.0337 16.1069 33.0388 17.9609H35V18.0386H33.0388C33.0338 19.8927 32.6694 21.6622 32.0116 23.2812H35V23.3589H31.9798C31.4115 24.7337 30.6312 25.9986 29.6796 27.1128V28.6016H35V28.6792H29.6796V34H29.602V28.6792H28.1132C26.999 29.6309 25.7341 30.4113 24.3592 30.9797V34H24.2816V31.0115C22.6625 31.6693 20.8929 32.0338 19.0388 32.0388V34H18.9612V32.0388C17.1071 32.0338 15.3375 31.6693 13.7184 31.0115V34H13.6408V30.9797C12.2659 30.4113 11.001 29.6309 9.88678 28.6792H8.39804V34H8.32037V28.6792H3V28.6016H8.32037V27.1128C7.36877 25.9986 6.58847 24.7337 6.02023 23.3589H3V23.2812H5.9884C5.3306 21.6622 4.96621 19.8927 4.96122 18.0386H3V17.9609H4.96122C4.96627 16.1069 5.33073 14.3373 5.9886 12.7183H3V12.6406H6.02044C6.58866 11.266 7.36889 10.0013 8.32037 8.88728V7.39798H3V7.32031H8.32037V2H8.39804V7.32031H9.88736C11.0014 6.36882 12.2661 5.58859 13.6408 5.02038V2H13.7184V4.98855C15.3375 4.33069 17.1071 3.96626 18.9612 3.96123V2ZM18.9612 4.0389C17.1062 4.04396 15.3364 4.41075 13.7184 5.07245V7.32031H18.9612V4.0389ZM13.6408 5.10449C12.3137 5.65662 11.0902 6.40763 10.0074 7.32031H13.6408V5.10449ZM9.79719 7.39798H8.39804V8.79711C8.8311 8.29865 9.29872 7.83103 9.79719 7.39798ZM8.39804 8.91598C8.86452 8.37206 9.37213 7.86446 9.91606 7.39798H13.6408V12.6406H8.39804V8.91598ZM8.32037 9.00733C7.4077 10.0901 6.65669 11.3136 6.10454 12.6406H8.32037V9.00733ZM6.0725 12.7183C5.41078 14.3362 5.04397 16.106 5.03889 17.9609H8.32037V12.7183H6.0725ZM5.03889 18.0386C5.04391 19.8935 5.41065 21.6633 6.0723 23.2812H8.32037V18.0386H5.03889ZM6.10434 23.3589C6.6565 24.6861 7.40759 25.9098 8.32037 26.9927V23.3589H6.10434ZM8.39804 27.2029V28.6016H9.79662C9.29837 28.1686 8.83093 27.7012 8.39804 27.2029ZM9.91548 28.6016C9.37178 28.1352 8.86436 27.6278 8.39804 27.0841V23.3589H13.6408V28.6016H9.91548ZM10.0068 28.6792C11.0898 29.5921 12.3135 30.3433 13.6408 30.8955V28.6792H10.0068ZM13.7184 30.9276C15.3364 31.5893 17.1062 31.9561 18.9612 31.9611V28.6792H13.7184V30.9276ZM19.0388 31.9611C20.8937 31.9561 22.6636 31.5893 24.2816 30.9276V28.6792H19.0388V31.9611ZM24.3592 30.8955C25.6865 30.3433 26.9102 29.5921 27.9932 28.6792H24.3592V30.8955ZM28.2034 28.6016H29.602V27.2029C29.1691 27.7012 28.7016 28.1686 28.2034 28.6016ZM29.602 27.0841C29.1356 27.6278 28.6282 28.1352 28.0845 28.6016H24.3592V23.3589H29.602V27.0841ZM29.6796 26.9927C30.5924 25.9098 31.3435 24.6861 31.8957 23.3589H29.6796V26.9927ZM31.9277 23.2812C32.5894 21.6633 32.9561 19.8935 32.9611 18.0386H29.6796V23.2812H31.9277ZM32.9611 17.9609C32.956 16.1061 32.5892 14.3362 31.9275 12.7183H29.6796V17.9609H32.9611ZM31.8955 12.6406C31.3433 11.3136 30.5923 10.0901 29.6796 9.00733V12.6406H31.8955ZM29.602 8.79711V7.39798H28.2028C28.7013 7.83103 29.1689 8.29865 29.602 8.79711ZM28.0839 7.39798C28.6279 7.86446 29.1355 8.37206 29.602 8.91598V12.6406H24.3592V7.39798H28.0839ZM27.9926 7.32031C26.9098 6.40763 25.6863 5.65662 24.3592 5.10449V7.32031H27.9926ZM24.2816 5.07245C22.6636 4.41074 20.8937 4.04395 19.0388 4.0389V7.32031H24.2816V5.07245ZM13.7184 7.39798H18.9612V12.6406H13.7184V7.39798ZM24.2816 7.39798H19.0388V12.6406H24.2816V7.39798ZM13.6408 23.2812H8.39804V18.0386H13.6408V23.2812ZM13.7184 23.3589V28.6016H18.9612V23.3589H13.7184ZM18.9612 23.2812H13.7184V18.0386H18.9612V23.2812ZM19.0388 23.3589V28.6016H24.2816V23.3589H19.0388ZM24.2816 23.2812H19.0388V18.0386H24.2816V23.2812ZM29.602 23.2812H24.3592V18.0386H29.602V23.2812ZM13.7184 12.7183H18.9612V17.9609H13.7184V12.7183ZM8.39804 12.7183L13.6408 12.7183V17.9609H8.39804V12.7183ZM24.2816 12.7183H19.0388V17.9609H24.2816V12.7183ZM24.3592 17.9609V12.7183L29.602 12.7183V17.9609H24.3592Z"
                            fill="#0A0D12"
                          ></path>
                        </g>
                        <g filter="url(#filter1_dd-_R_5apbsnpfiv7b_">
                          <rect
                            x="11"
                            y="10"
                            width="16"
                            height="16"
                            rx="8"
                            fill="url(#paint1_linear-_R_5apbsnpfiv7b_"
                          ></rect>
                          <rect
                            x="11"
                            y="10"
                            width="16"
                            height="16"
                            rx="8"
                            fill="url(#paint2_radial-_R_5apbsnpfiv7b_"
                            fillOpacity="0.08"
                          ></rect>
                          <rect
                            x="11"
                            y="10"
                            width="16"
                            height="16"
                            rx="8"
                            fill="url(#paint3_radial-_R_5apbsnpfiv7b_"
                            fillOpacity="0.18"
                          ></rect>
                          <rect
                            x="11"
                            y="10"
                            width="16"
                            height="16"
                            rx="8"
                            fill="url(#paint4_radial-_R_5apbsnpfiv7b_"
                            fillOpacity="0.05"
                          ></rect>
                          <path
                            d="M23.8 14.0414C23.8 15.3898 21.651 14.5297 19 14.5297C16.349 14.5297 14.2 15.3898 14.2 14.0414C14.2 12.693 16.349 11.6 19 11.6C21.651 11.6 23.8 12.693 23.8 14.0414Z"
                            fill="url(#paint5_linear-_R_5apbsnpfiv7b_"
                            fillOpacity="0.4"
                          ></path>
                        </g>
                      </g>
                      <path
                        d="M3.1 14.8C3.1 12.5581 3.10008 10.8828 3.20866 9.55376C3.31715 8.22593 3.53345 7.25268 3.96105 6.41348C4.71845 4.92699 5.92699 3.71845 7.41348 2.96105C8.25268 2.53345 9.22593 2.31715 10.5538 2.20866C11.8828 2.10008 13.5581 2.1 15.8 2.1H22.2C24.4419 2.1 26.1172 2.10008 27.4462 2.20866C28.7741 2.31715 29.7473 2.53345 30.5865 2.96105C32.073 3.71845 33.2816 4.92699 34.039 6.41348C34.4665 7.25268 34.6828 8.22593 34.7913 9.55376C34.8999 10.8828 34.9 12.5581 34.9 14.8V21.2C34.9 23.4419 34.8999 25.1172 34.7913 26.4462C34.6828 27.7741 34.4665 28.7473 34.039 29.5865C33.2816 31.073 32.073 32.2816 30.5865 33.039C29.7473 33.4665 28.7741 33.6828 27.4462 33.7913C26.1172 33.8999 24.4419 33.9 22.2 33.9H15.8C13.5581 33.9 11.8828 33.8999 10.5538 33.7913C9.22593 33.6828 8.25268 33.4665 7.41348 33.039C5.92699 32.2816 4.71845 31.073 3.96105 29.5865C3.53345 28.7473 3.31715 27.7741 3.20866 26.4462C3.10008 25.1172 3.1 23.4419 3.1 21.2V14.8Z"
                        stroke="#0A0D12"
                        strokeOpacity="0.12"
                        strokeWidth="0.2"
                      ></path>
                    </g>
                    <image
                      href="data:image/webp;base64,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"
                      x="0"
                      y="19"
                      width="38"
                      height="19"
                      transform="scale(0.84) translate(0, -1.5)"
                      className="origin-center"
                      preserveAspectRatio="xMidYMax slice"
                      clipPath="url(#imageClip-_R_5apbsnpfiv7b_)"
                    ></image>
                    <defs>
                      <clipPath id="imageClip-_R_5apbsnpfiv7b_">
                        <path d="M 0 19 L 38 19 L 38 28.88  A 9.12 9.12 0 0 1 28.88 38 L 9.12 38 A 9.12 9.12 0 0 1 0 28.88 Z"></path>
                      </clipPath>
                      <filter
                        id="filter0-_R_5apbsnpfiv7b_"
                        x="0"
                        y="0"
                        width="38"
                        height="38"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood
                          floodOpacity="0"
                          result="BackgroundImageFix"
                        ></feFlood>
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        ></feColorMatrix>
                        <feOffset dy="1"></feOffset>
                        <feGaussianBlur stdDeviation="1"></feGaussianBlur>
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.06 0"
                        ></feColorMatrix>
                        <feBlend
                          mode="normal"
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow"
                        ></feBlend>
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        ></feColorMatrix>
                        <feOffset dy="1"></feOffset>
                        <feGaussianBlur stdDeviation="1.5"></feGaussianBlur>
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.1 0"
                        ></feColorMatrix>
                        <feBlend
                          mode="normal"
                          in2="effect1_dropShadow"
                          result="effect2_dropShadow"
                        ></feBlend>
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        ></feColorMatrix>
                        <feMorphology
                          radius="0.5"
                          operator="erode"
                          in="SourceAlpha"
                          result="effect3_dropShadow"
                        ></feMorphology>
                        <feOffset dy="1"></feOffset>
                        <feGaussianBlur stdDeviation="0.5"></feGaussianBlur>
                        <feComposite
                          in2="hardAlpha"
                          operator="out"
                        ></feComposite>
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.13 0"
                        ></feColorMatrix>
                        <feBlend
                          mode="normal"
                          in2="effect2_dropShadow"
                          result="effect3_dropShadow"
                        ></feBlend>
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect3_dropShadow"
                          result="shape"
                        ></feBlend>
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        ></feColorMatrix>
                        <feOffset dy="-0.5"></feOffset>
                        <feGaussianBlur stdDeviation="0.25"></feGaussianBlur>
                        <feComposite
                          in2="hardAlpha"
                          operator="arithmetic"
                          k2="-1"
                          k3="1"
                        ></feComposite>
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.1 0"
                        ></feColorMatrix>
                        <feBlend
                          mode="normal"
                          in2="shape"
                          result="effect4_innerShadow"
                        ></feBlend>
                      </filter>
                      <filter
                        id="filter1_dd-_R_5apbsnpfiv7b_"
                        x="8"
                        y="8"
                        width="22"
                        height="22"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood
                          floodOpacity="0"
                          result="BackgroundImageFix"
                        ></feFlood>
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        ></feColorMatrix>
                        <feOffset dy="1"></feOffset>
                        <feGaussianBlur stdDeviation="1"></feGaussianBlur>
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.06 0"
                        ></feColorMatrix>
                        <feBlend
                          mode="normal"
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow"
                        ></feBlend>
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        ></feColorMatrix>
                        <feOffset dy="1"></feOffset>
                        <feGaussianBlur stdDeviation="1.5"></feGaussianBlur>
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.1 0"
                        ></feColorMatrix>
                        <feBlend
                          mode="normal"
                          in2="effect1_dropShadow"
                          result="effect2_dropShadow"
                        ></feBlend>
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect2_dropShadow"
                          result="shape"
                        ></feBlend>
                      </filter>
                      <filter
                        id="filter2_b-_R_5apbsnpfiv7b_"
                        x="-2"
                        y="13"
                        width="42"
                        height="26"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood
                          floodOpacity="0"
                          result="BackgroundImageFix"
                        ></feFlood>
                        <feGaussianBlur
                          in="BackgroundImageFix"
                          stdDeviation="2.5"
                        ></feGaussianBlur>
                        <feComposite
                          in2="SourceAlpha"
                          operator="in"
                          result="effect1_backgroundBlur"
                        ></feComposite>
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect1_backgroundBlur"
                          result="shape"
                        ></feBlend>
                      </filter>
                      <linearGradient
                        id="paint0_linear-_R_5apbsnpfiv7b_"
                        x1="19"
                        y1="2"
                        x2="19"
                        y2="34"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="white"></stop>
                        <stop offset="1" stopColor="#0A0D12"></stop>
                      </linearGradient>
                      <linearGradient
                        id="paint1_linear-_R_5apbsnpfiv7b_"
                        x1="15"
                        y1="26"
                        x2="23"
                        y2="10"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#53389E"></stop>
                        <stop offset="1" stopColor="#6941C6"></stop>
                      </linearGradient>
                      <radialGradient
                        id="paint2_radial-_R_5apbsnpfiv7b_"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(19 10) rotate(90) scale(12)"
                      >
                        <stop stopColor="white" stopOpacity="0"></stop>
                        <stop
                          offset="0.5"
                          stopColor="white"
                          stopOpacity="0"
                        ></stop>
                        <stop offset="0.99" stopColor="white"></stop>
                        <stop
                          offset="1"
                          stopColor="white"
                          stopOpacity="0"
                        ></stop>
                      </radialGradient>
                      <radialGradient
                        id="paint3_radial-_R_5apbsnpfiv7b_"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(19 18) rotate(90) scale(8)"
                      >
                        <stop
                          offset="0.746599"
                          stopColor="white"
                          stopOpacity="0"
                        ></stop>
                        <stop offset="1" stopColor="white"></stop>
                      </radialGradient>
                      <radialGradient
                        id="paint4_radial-_R_5apbsnpfiv7b_"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(19 14.6) rotate(90) scale(7)"
                      >
                        <stop stopColor="white"></stop>
                        <stop
                          offset="1"
                          stopColor="white"
                          stopOpacity="0"
                        ></stop>
                      </radialGradient>
                      <linearGradient
                        id="paint5_linear-_R_5apbsnpfiv7b_"
                        x1="19"
                        y1="11.6"
                        x2="19"
                        y2="14.8"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="white"></stop>
                        <stop
                          offset="1"
                          stopColor="white"
                          stopOpacity="0.1"
                        ></stop>
                      </linearGradient>
                      <clipPath id="clip0-_R_5apbsnpfiv7b_">
                        <path
                          d="M3 14.8C3 10.3196 3 8.07937 3.87195 6.36808C4.63893 4.86278 5.86278 3.63893 7.36808 2.87195C9.07937 2 11.3196 2 15.8 2H22.2C26.6804 2 28.9206 2 30.6319 2.87195C32.1372 3.63893 33.3611 4.86278 34.1281 6.36808C35 8.07937 35 10.3196 35 14.8V21.2C35 25.6804 35 27.9206 34.1281 29.6319C33.3611 31.1372 32.1372 32.3611 30.6319 33.1281C28.9206 34 26.6804 34 22.2 34H15.8C11.3196 34 9.07937 34 7.36808 33.1281C5.86278 32.3611 4.63893 31.1372 3.87195 29.6319C3 27.9206 3 25.6804 3 21.2V14.8Z"
                          fill="white"
                        ></path>
                      </clipPath>
                      <clipPath id="clip1-_R_5apbsnpfiv7b_">
                        <rect
                          width="32"
                          height="32"
                          fill="white"
                          transform="translate(3 2)"
                        ></rect>
                      </clipPath>
                    </defs>
                  </svg>
                  <div className="aspect-[0.3] h-full"></div>
                  <svg
                    viewBox="0 0 97 32"
                    fill="none"
                    className="aspect-[3] h-full shrink-0"
                  >
                    <path
                      d="M33.9101 10.2372C34.2321 10.5355 34.6179 10.6847 35.0678 10.6847C35.5176 10.6847 35.9011 10.5355 36.2183 10.2372C36.5403 9.9342 36.7013 9.57199 36.7013 9.15058C36.7013 8.73392 36.5403 8.37644 36.2183 8.07814C35.9011 7.77511 35.5176 7.6236 35.0678 7.6236C34.6179 7.6236 34.2321 7.77511 33.9101 8.07814C33.5928 8.37644 33.4342 8.73392 33.4342 9.15058C33.4342 9.57199 33.5928 9.9342 33.9101 10.2372Z"
                      className="fill-fg-primary"
                    ></path>
                    <path
                      d="M11.2997 20.6847C11.8063 19.8892 12.0597 18.9612 12.0597 17.9006V8.45456H8.98438V17.6378C8.98438 18.1918 8.86127 18.6842 8.61506 19.1151C8.37358 19.5459 8.0303 19.8845 7.58523 20.1307C7.14489 20.3769 6.62642 20.5 6.02983 20.5C5.43797 20.5 4.91951 20.3769 4.47443 20.1307C4.02936 19.8845 3.68371 19.5459 3.4375 19.1151C3.19602 18.6842 3.07528 18.1918 3.07528 17.6378V8.45456H0V17.9006C0 18.9612 0.250947 19.8892 0.752841 20.6847C1.25473 21.4801 1.95786 22.1004 2.86222 22.5455C3.76657 22.9858 4.82244 23.206 6.02983 23.206C7.23248 23.206 8.28599 22.9858 9.19034 22.5455C10.0947 22.1004 10.7978 21.4801 11.2997 20.6847Z"
                      className="fill-fg-primary"
                    ></path>
                    <path
                      d="M18.3589 12.51C17.7907 12.8793 17.3859 13.3812 17.1444 14.0156H17.0165V12.0909H14.133V23H17.1586V16.6932C17.1633 16.2244 17.2509 15.8244 17.4214 15.4929C17.5966 15.1567 17.838 14.9011 18.1458 14.7259C18.4583 14.5507 18.8182 14.4631 19.2254 14.4631C19.8314 14.4631 20.3073 14.6525 20.6529 15.0313C20.9986 15.4053 21.169 15.9262 21.1643 16.5938V23H24.1898V16.054C24.1898 15.2065 24.0336 14.4773 23.7211 13.8665C23.4086 13.251 22.9706 12.7775 22.4072 12.446C21.8437 12.1146 21.1832 11.9489 20.4256 11.9489C19.616 11.9489 18.9271 12.1359 18.3589 12.51Z"
                      className="fill-fg-primary"
                    ></path>
                    <path
                      d="M27.3463 21.821C27.0433 21.3523 26.8941 20.7604 26.8989 20.0455V14.3637H25.4074V12.0909H26.8989V9.47729H29.9244V12.0909H31.977V14.3637H29.9244V19.6477C29.9244 19.9271 29.967 20.1449 30.0523 20.3012C30.1375 20.4527 30.2559 20.5592 30.4074 20.6208C30.5636 20.6823 30.7436 20.7131 30.9472 20.7131C31.0892 20.7131 31.2313 20.7012 31.3733 20.6776C31.5153 20.6492 31.6242 20.6279 31.7 20.6137L32.1759 22.8651C32.0243 22.9124 31.8113 22.9669 31.5366 23.0284C31.262 23.0947 30.9282 23.135 30.5352 23.1492C29.8061 23.1776 29.1669 23.0805 28.6176 22.858C28.0731 22.6354 27.6493 22.2898 27.3463 21.821Z"
                      className="fill-fg-primary"
                    ></path>
                    <path
                      d="M39.769 21.821C39.4659 21.3523 39.3168 20.7604 39.3215 20.0455V14.3637H37.83V12.0909H39.3215V9.47729H42.3471V12.0909H44.3996V14.3637H42.3471V19.6477C42.3471 19.9271 42.3897 20.1449 42.4749 20.3012C42.5602 20.4527 42.6785 20.5592 42.83 20.6208C42.9863 20.6823 43.1662 20.7131 43.3698 20.7131C43.5119 20.7131 43.6539 20.7012 43.796 20.6776C43.938 20.6492 44.0469 20.6279 44.1227 20.6137L44.5985 22.8651C44.447 22.9124 44.2339 22.9669 43.9593 23.0284C43.6847 23.0947 43.3509 23.135 42.9579 23.1492C42.2287 23.1776 41.5895 23.0805 41.0403 22.858C40.4958 22.6354 40.072 22.2898 39.769 21.821Z"
                      className="fill-fg-primary"
                    ></path>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M56.2257 23.2131C55.1035 23.2131 54.1376 22.9858 53.328 22.5313C52.5231 22.072 51.9028 21.4233 51.4672 20.5852C51.0316 19.7424 50.8138 18.7458 50.8138 17.5952C50.8138 16.473 51.0316 15.4882 51.4672 14.6406C51.9028 13.7931 52.516 13.1326 53.3067 12.6591C54.1021 12.1856 55.0349 11.9489 56.105 11.9489C56.8247 11.9489 57.4946 12.0649 58.1149 12.2969C58.7399 12.5242 59.2844 12.8674 59.7484 13.3267C60.2172 13.786 60.5818 14.3637 60.8422 15.0597C61.1026 15.751 61.2328 16.5606 61.2328 17.4887V18.3196H53.8038V18.3267C53.8038 18.8665 53.9033 19.3329 54.1021 19.7259C54.3057 20.1189 54.5922 20.4219 54.9615 20.635C55.3308 20.848 55.7688 20.9546 56.2754 20.9546C56.6116 20.9546 56.9194 20.9072 57.1987 20.8125C57.4781 20.7178 57.7172 20.5758 57.916 20.3864C58.1149 20.197 58.2664 19.965 58.3706 19.6904L61.1689 19.875C61.0268 20.5474 60.7357 21.1345 60.2953 21.6364C59.8597 22.1335 59.2963 22.5218 58.605 22.8012C57.9184 23.0758 57.1253 23.2131 56.2257 23.2131ZM54.1092 15.3722C53.9258 15.6954 53.8249 16.0529 53.8067 16.4446H58.3848C58.3848 16.009 58.2901 15.6231 58.1007 15.2869C57.9113 14.9508 57.6485 14.688 57.3124 14.4986C56.9809 14.3045 56.595 14.2074 56.1547 14.2074C55.6954 14.2074 55.2882 14.3139 54.9331 14.527C54.5827 14.7353 54.3081 15.0171 54.1092 15.3722Z"
                      className="fill-fg-primary"
                    ></path>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M64.5757 22.5384C65.2481 22.9645 65.9985 23.1776 66.8271 23.1776C67.4143 23.1776 67.9114 23.0805 68.3186 22.8864C68.7305 22.6923 69.0643 22.4484 69.32 22.1548C69.5804 21.8566 69.7817 21.5559 69.9237 21.2529H70.0516V23H73.0345V8.45456H70.0161V13.9233H69.9237C69.7911 13.6298 69.597 13.3315 69.3413 13.0284C69.0904 12.7207 68.7589 12.465 68.347 12.2614C67.9398 12.053 67.4308 11.9489 66.82 11.9489C66.0198 11.9489 65.2836 12.1572 64.6112 12.5739C63.9436 12.9858 63.4086 13.6084 63.0061 14.4418C62.6036 15.2704 62.4024 16.3097 62.4024 17.5597C62.4024 18.7765 62.5965 19.804 62.9848 20.6421C63.3778 21.4754 63.9081 22.1075 64.5757 22.5384ZM69.0217 20.3722C68.6856 20.6373 68.2736 20.7699 67.7859 20.7699C67.2888 20.7699 66.8698 20.635 66.5288 20.3651C66.1927 20.0905 65.9346 19.7117 65.7547 19.2287C65.5795 18.741 65.4919 18.1799 65.4919 17.5455C65.4919 16.9157 65.5795 16.3618 65.7547 15.8835C65.9299 15.4053 66.1879 15.0313 66.5288 14.7614C66.8698 14.4915 67.2888 14.3566 67.7859 14.3566C68.2736 14.3566 68.6879 14.4868 69.0288 14.7472C69.3698 15.0076 69.6302 15.3769 69.8101 15.8551C69.99 16.3334 70.08 16.8968 70.08 17.5455C70.08 18.1941 69.9876 18.76 69.803 19.2429C69.6231 19.7259 69.3626 20.1023 69.0217 20.3722Z"
                      className="fill-fg-primary"
                    ></path>
                    <path
                      d="M88.0229 19.1151C88.2691 18.6842 88.3922 18.1918 88.3922 17.6378V8.45456H91.4675V17.9006C91.4675 18.9612 91.2142 19.8892 90.7075 20.6847C90.2056 21.4801 89.5025 22.1004 88.5982 22.5455C87.6938 22.9858 86.6403 23.206 85.4376 23.206C84.2303 23.206 83.1744 22.9858 82.27 22.5455C81.3657 22.1004 80.6625 21.4801 80.1607 20.6847C79.6588 19.8892 79.4078 18.9612 79.4078 17.9006V8.45456H82.4831V17.6378C82.4831 18.1918 82.6038 18.6842 82.8453 19.1151C83.0915 19.5459 83.4372 19.8845 83.8822 20.1307C84.3273 20.3769 84.8458 20.5 85.4376 20.5C86.0342 20.5 86.5527 20.3769 86.993 20.1307C87.4381 19.8845 87.7814 19.5459 88.0229 19.1151Z"
                      className="fill-fg-primary"
                    ></path>
                    <path
                      d="M33.5479 12.0909V23H36.5734V12.0909H33.5479Z"
                      className="fill-fg-primary"
                    ></path>
                    <path
                      d="M49.2305 23V8.45456H46.2049V23H49.2305Z"
                      className="fill-fg-primary"
                    ></path>
                    <path
                      d="M96.6729 23V8.45456H93.5977V23H96.6729Z"
                      className="fill-fg-primary"
                    ></path>
                  </svg>
                </div>
                <p className="text-md text-tertiary_on-brand">
                  Design amazing digital experiences that create more happy in
                  the world.
                </p>
              </div>
              <nav>
                <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-[repeat(6,max-content)]">
                  <li>
                    <Link
                      className="group relative inline-flex h-max cursor-pointer items-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-r-none in-data-input-wrapper:in-data-leading:before:rounded-r-none in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-l-none in-data-input-wrapper:in-data-trailing:before:rounded-l-none disabled:cursor-not-allowed disabled:text-fg-disabled disabled:*:data-icon:text-fg-disabled_subtle *:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3 justify-normal rounded p-0! *:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current *:data-icon:text-fg-brand-secondary_alt hover:*:data-icon:text-fg-brand-secondary_hover gap-1.5 text-footer-button-fg hover:text-footer-button-fg_hover"
                      data-rac=""
                      href="/react#"
                      data-react-aria-pressable="true"
                    >
                      <span data-text="true" className="transition-inherit-all">
                        Overview
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="group relative inline-flex h-max cursor-pointer items-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-r-none in-data-input-wrapper:in-data-leading:before:rounded-r-none in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-l-none in-data-input-wrapper:in-data-trailing:before:rounded-l-none disabled:cursor-not-allowed disabled:text-fg-disabled disabled:*:data-icon:text-fg-disabled_subtle *:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3 justify-normal rounded p-0! *:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current *:data-icon:text-fg-brand-secondary_alt hover:*:data-icon:text-fg-brand-secondary_hover gap-1.5 text-footer-button-fg hover:text-footer-button-fg_hover"
                      data-rac=""
                      href="/react#"
                      data-react-aria-pressable="true"
                    >
                      <span data-text="true" className="transition-inherit-all">
                        Features
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="group relative inline-flex h-max cursor-pointer items-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-r-none in-data-input-wrapper:in-data-leading:before:rounded-r-none in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-l-none in-data-input-wrapper:in-data-trailing:before:rounded-l-none disabled:cursor-not-allowed disabled:text-fg-disabled disabled:*:data-icon:text-fg-disabled_subtle *:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3 justify-normal rounded p-0! *:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current *:data-icon:text-fg-brand-secondary_alt hover:*:data-icon:text-fg-brand-secondary_hover gap-1.5 text-footer-button-fg hover:text-footer-button-fg_hover"
                      data-rac=""
                      href="/react#"
                      data-react-aria-pressable="true"
                    >
                      <span data-text="true" className="transition-inherit-all">
                        Pricing
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="group relative inline-flex h-max cursor-pointer items-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-r-none in-data-input-wrapper:in-data-leading:before:rounded-r-none in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-l-none in-data-input-wrapper:in-data-trailing:before:rounded-l-none disabled:cursor-not-allowed disabled:text-fg-disabled disabled:*:data-icon:text-fg-disabled_subtle *:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3 justify-normal rounded p-0! *:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current *:data-icon:text-fg-brand-secondary_alt hover:*:data-icon:text-fg-brand-secondary_hover gap-1.5 text-footer-button-fg hover:text-footer-button-fg_hover"
                      data-rac=""
                      href="/react#"
                      data-react-aria-pressable="true"
                    >
                      <span data-text="true" className="transition-inherit-all">
                        Careers
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="group relative inline-flex h-max cursor-pointer items-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-r-none in-data-input-wrapper:in-data-leading:before:rounded-r-none in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-l-none in-data-input-wrapper:in-data-trailing:before:rounded-l-none disabled:cursor-not-allowed disabled:text-fg-disabled disabled:*:data-icon:text-fg-disabled_subtle *:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3 justify-normal rounded p-0! *:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current *:data-icon:text-fg-brand-secondary_alt hover:*:data-icon:text-fg-brand-secondary_hover gap-1.5 text-footer-button-fg hover:text-footer-button-fg_hover"
                      data-rac=""
                      href="/react#"
                      data-react-aria-pressable="true"
                    >
                      <span data-text="true" className="transition-inherit-all">
                        Help
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="group relative inline-flex h-max cursor-pointer items-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-r-none in-data-input-wrapper:in-data-leading:before:rounded-r-none in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-l-none in-data-input-wrapper:in-data-trailing:before:rounded-l-none disabled:cursor-not-allowed disabled:text-fg-disabled disabled:*:data-icon:text-fg-disabled_subtle *:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3 justify-normal rounded p-0! *:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current *:data-icon:text-fg-brand-secondary_alt hover:*:data-icon:text-fg-brand-secondary_hover gap-1.5 text-footer-button-fg hover:text-footer-button-fg_hover"
                      data-rac=""
                      href="/react#"
                      data-react-aria-pressable="true"
                    >
                      <span data-text="true" className="transition-inherit-all">
                        Privacy
                      </span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div></div>
          </div>
          <div className="mt-12 flex flex-col-reverse justify-between gap-6 border-t border-brand_alt pt-8 md:mt-16 md:flex-row">
            <p className="text-md text-quaternary_on-brand">
              © 2077 Untitled UI. All rights reserved.
            </p>
            <ul className="flex gap-6">
              <li>
                <Link
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex rounded-xs text-icon-fg-brand_on-brand outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 22"
                    fill="none"
                    aria-label="X (formerly Twitter)"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.9455 22L10.396 14.0901L3.44886 22H0.509766L9.09209 12.2311L0.509766 0H8.05571L13.286 7.45502L19.8393 0H22.7784L14.5943 9.31648L23.4914 22H15.9455ZM19.2185 19.77H17.2398L4.71811 2.23H6.6971L11.7121 9.25316L12.5793 10.4719L19.2185 19.77Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex rounded-xs text-icon-fg-brand_on-brand outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-label="LinkedIn"
                  >
                    <path
                      d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5563 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2938 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516V20.4516Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex rounded-xs text-icon-fg-brand_on-brand outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-label="Facebook"
                  >
                    <path
                      d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex rounded-xs text-icon-fg-brand_on-brand outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-label="GitHub"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 0C5.3724 0 0 5.3808 0 12.0204C0 17.3304 3.438 21.8364 8.2068 23.4252C8.8068 23.5356 9.0252 23.1648 9.0252 22.8456C9.0252 22.5612 9.0156 21.804 9.0096 20.802C5.6712 21.528 4.9668 19.1904 4.9668 19.1904C4.422 17.8008 3.6348 17.4312 3.6348 17.4312C2.5452 16.6872 3.7176 16.7016 3.7176 16.7016C4.9212 16.7856 5.5548 17.94 5.5548 17.94C6.6252 19.776 8.364 19.2456 9.0468 18.9384C9.1572 18.162 9.4668 17.6328 9.81 17.3328C7.146 17.0292 4.344 15.9972 4.344 11.3916C4.344 10.08 4.812 9.006 5.5788 8.166C5.4552 7.8624 5.0436 6.6396 5.6964 4.986C5.6964 4.986 6.7044 4.662 8.9964 6.2172C9.97532 5.95022 10.9853 5.81423 12 5.8128C13.02 5.8176 14.046 5.9508 15.0048 6.2172C17.2956 4.662 18.3012 4.9848 18.3012 4.9848C18.9564 6.6396 18.5436 7.8624 18.4212 8.166C19.1892 9.006 19.6548 10.08 19.6548 11.3916C19.6548 16.0092 16.848 17.0256 14.1756 17.3232C14.6064 17.694 14.9892 18.4272 14.9892 19.5492C14.9892 21.1548 14.9748 22.452 14.9748 22.8456C14.9748 23.1672 15.1908 23.5416 15.8004 23.424C18.19 22.6225 20.2672 21.0904 21.7386 19.0441C23.2099 16.9977 24.001 14.5408 24 12.0204C24 5.3808 18.6264 0 12 0Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="https://angel.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex rounded-xs text-icon-fg-brand_on-brand outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-label="AngelList"
                  >
                    <path
                      d="M17.7705 10.0969C18.319 8.56875 19.8986 4.14844 19.8986 2.73281C19.8986 1.48594 19.1627 0.440625 17.8502 0.440625C15.7596 0.440625 13.8846 6.61406 13.2986 8.08594C12.844 6.75 10.7158 0 8.84083 0C7.38301 0 6.69864 1.07344 6.69864 2.42344C6.69864 4.07812 8.30176 8.36719 8.88301 10.0172C8.5877 9.90937 8.26895 9.81562 7.94551 9.81562C6.84864 9.81562 5.68145 11.1797 5.68145 12.2812C5.68145 12.6984 5.91114 13.2844 6.05645 13.6734C4.32676 14.1422 3.66114 15.2953 3.66114 17.0344C3.65645 20.4187 6.8627 24 11.3721 24C16.9033 24 20.344 19.8469 20.344 14.4891C20.344 12.4688 20.0205 10.6453 17.7705 10.0969V10.0969ZM16.1111 5.0625C16.2986 4.48594 17.1002 2.04844 17.8502 2.04844C18.2533 2.04844 18.3611 2.46563 18.3611 2.79844C18.3611 3.69375 16.5518 8.63906 16.1533 9.73594L14.5596 9.45469L16.1111 5.0625V5.0625ZM8.17051 2.26406C8.17051 1.70625 8.8502 0.121875 10.3408 4.47188L11.9627 9.17344C11.2315 9.1125 10.6643 9.03281 10.3033 9.23906C9.79239 7.88906 8.17051 3.62812 8.17051 2.26406V2.26406ZM8.0627 11.4375C9.43614 11.4375 11.208 15.8719 11.208 16.4719C11.208 16.7109 10.9783 17.0062 10.7111 17.0062C9.73145 17.0062 7.10645 13.4016 7.10645 12.4266C7.11114 12.0656 7.70176 11.4375 8.0627 11.4375V11.4375ZM16.7018 20.1703C15.3377 21.6703 13.594 22.4484 11.5596 22.4484C8.7752 22.4484 6.57676 20.9203 5.51739 18.3094C4.71583 16.275 5.69551 15.1078 6.48301 15.1078C7.01739 15.1078 9.02833 17.9344 9.02833 18.5344C9.02833 18.7641 8.66739 18.9234 8.47989 18.9234C7.7252 18.9234 7.42989 18.1969 6.08458 16.5141C4.69239 17.9062 7.04551 20.5875 8.81739 20.5875C10.0408 20.5875 10.8377 19.4531 10.5986 18.6188C10.7721 18.6188 10.9877 18.6328 11.1471 18.5906C11.1986 19.8609 11.5736 21.375 13.1018 21.4828C13.1018 21.4406 13.1955 21.15 13.1955 21.1359C13.1955 20.3203 12.6986 19.6078 12.6986 18.7781C12.6986 17.4516 13.7158 16.1672 14.7471 15.4172C15.1221 15.1359 15.5768 14.9625 16.0174 14.8031C16.4721 14.6297 16.9549 14.4281 17.3018 14.0812C17.2502 13.5562 17.0346 13.0922 16.5096 13.0922C15.2111 13.0922 10.8565 13.2797 10.8565 11.2313C10.8565 10.9172 10.8611 10.6172 11.6721 10.6172C13.1861 10.6172 17.0299 10.9922 18.1549 11.9813C19.0033 12.7359 19.294 17.2875 16.7018 20.1703V20.1703ZM12.0799 14.2641C12.5346 14.4094 13.0033 14.4516 13.4721 14.5453C13.1252 14.7984 12.8158 15.1078 12.5205 15.4406C12.3893 15.0422 12.2299 14.6531 12.0799 14.2641V14.2641Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="https://dribbble.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex rounded-xs text-icon-fg-brand_on-brand outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-label="Dribbble"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 0C5.37527 0 0 5.37527 0 12C0 18.6248 5.37527 24 12 24C18.6117 24 24 18.6248 24 12C24 5.37527 18.6117 0 12 0ZM19.9262 5.53145C21.3579 7.27549 22.217 9.50107 22.243 11.9089C21.9046 11.8438 18.5206 11.154 15.1106 11.5835C15.0325 11.4143 14.9675 11.2321 14.8894 11.0499C14.6811 10.5554 14.4469 10.0477 14.2126 9.56617C17.9869 8.0304 19.705 5.81779 19.9262 5.53145ZM12 1.77007C14.603 1.77007 16.9848 2.74621 18.7939 4.34708C18.6117 4.60738 17.0629 6.67679 13.4186 8.04337C11.7397 4.95878 9.87855 2.43384 9.5922 2.04338C10.3601 1.86117 11.1671 1.77007 12 1.77007ZM7.63995 2.73319C7.91325 3.09761 9.73538 5.63558 11.4404 8.65508C6.65076 9.9306 2.42083 9.90458 1.96529 9.90458C2.62906 6.72885 4.77657 4.08676 7.63995 2.73319ZM1.74404 12.0131C1.74404 11.9089 1.74404 11.8048 1.74404 11.7007C2.18655 11.7136 7.15835 11.7787 12.2733 10.243C12.5727 10.8156 12.846 11.4013 13.1063 11.987C12.9761 12.026 12.8329 12.0651 12.7028 12.1041C7.41865 13.8091 4.60738 18.4685 4.3731 18.859C2.7462 17.0499 1.74404 14.6421 1.74404 12.0131ZM12 22.256C9.6312 22.256 7.44469 21.449 5.71366 20.0954C5.89588 19.718 7.97827 15.7094 13.757 13.692C13.783 13.679 13.7961 13.679 13.8221 13.666C15.2668 17.4013 15.8525 20.5379 16.0087 21.436C14.7722 21.9696 13.4186 22.256 12 22.256ZM17.7137 20.4989C17.6096 19.8742 17.0629 16.8807 15.7223 13.1974C18.9371 12.6898 21.7484 13.5228 22.0998 13.6399C21.6573 16.4902 20.0174 18.9501 17.7137 20.4989Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="https://layers.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex rounded-xs text-icon-fg-brand_on-brand outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-label="Layers"
                  >
                    <g clipPath="url(#clip0_7441_94320)">
                      <path
                        opacity="0.2"
                        d="M0.363357 13.6945L0.421539 4.96865C0.431721 3.38902 1.53645 2.03484 3.06154 1.73302L11.4884 0.0624719C13.5132 -0.338983 15.3924 1.24574 15.3794 3.34247L15.3212 12.0697C15.3103 13.6487 14.2055 15.0021 12.6804 15.3047L4.25354 16.9752C2.22881 17.3767 0.349539 15.7919 0.363357 13.6945Z"
                        fill="currentColor"
                      ></path>
                      <path
                        opacity="0.5"
                        d="M4.49226 17.1762L4.55044 8.44892C4.5599 6.87073 5.66535 5.51728 7.19045 5.21473L15.6174 3.54492C17.6421 3.14346 19.5214 4.72746 19.5075 6.82492L19.4494 15.5522C19.4392 17.1311 18.3344 18.4846 16.8094 18.7871L8.38245 20.4576C6.35772 20.8584 4.47845 19.2744 4.49226 17.1776V17.1762Z"
                        fill="currentColor"
                      ></path>
                      <path
                        opacity="0.8"
                        d="M8.62091 20.6576L8.67909 11.9303C8.68928 10.3507 9.794 8.99797 11.3191 8.69542L19.746 7.02487C21.7707 6.62342 23.65 8.20815 23.6362 10.3049L23.578 19.0321C23.5678 20.6118 22.4631 21.9652 20.938 22.2671L12.5111 23.9376C10.4864 24.3391 8.60709 22.7543 8.62019 20.6576H8.62091Z"
                        fill="currentColor"
                      ></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_7441_94320">
                        <rect width="24" height="24" fill="white"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
