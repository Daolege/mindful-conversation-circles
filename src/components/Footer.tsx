
import React from 'react';
import { Mail, Phone, MapPin, Globe, ExternalLink, MessageSquare } from 'lucide-react';
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { handleContactMethodsQueryError, ContactMethod } from "@/lib/supabaseUtils";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from 'react-router-dom';
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Separator } from "@/components/ui/separator";

interface FooterLink {
  href: string;
  label: string;
  translationKey: string;
  external?: boolean;
}

// Payment method icons as SVG components
const PaymentIcons = () => {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {/* Visa */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#1434CB">
          <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3c.433 0 .822.287.918.783l.839 4.468L7.15 8.262h1.962zm7.453 5.035c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628.279-.036 1.043-.064 1.911.333l.339-1.589c-.466-.169-1.067-.332-1.814-.332-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.039.756.367 1.01.603.006.985-.516.255-1.236.292-1.95.075-.471-.14-.719-.315-.929-.505l-.341 1.597c.212.097 1.109.464 2.221.464 2.099 0 3.474-1.008 3.482-2.573l-.014-.368zm5.24.004l1.447-1.584-1.005-1.606h-1.3l.639 1.033-.789 1.134-.743-1.134.647-1.033h-2.025l-1.475 1.581.984 1.609h1.309l-.634-1.035.783-1.142.752 1.142-.65 1.035h2.06zM13.49 8.262l-1.548 7.496h-1.852l1.547-7.496h1.853z"/>
        </svg>
      </div>
      
      {/* Mastercard */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <defs>
            <mask id="mastercard-circle-mask">
              <rect width="100%" height="100%" fill="white"/>
              <circle cx="9" cy="12" r="7" fill="black"/>
            </mask>
          </defs>
          <circle cx="9" cy="12" r="7" fill="#EB001B"/>
          <circle cx="15" cy="12" r="7" fill="#F79E1B"/>
          <circle cx="12" cy="12" r="7" fill="#FF5F00" mask="url(#mastercard-circle-mask)"/>
        </svg>
      </div>
      
      {/* American Express */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#006FCF">
          <path d="M22.588 10.516h-1.23l-0.885-2.126h-0.026v2.126h-1.097v-4.866h2.001c1.075 0 1.664 0.696 1.664 1.444 0 0.961-0.666 1.297-0.794 1.359zM21.184 8.318c0.429 0 0.575-0.356 0.575-0.57 0-0.222-0.146-0.577-0.575-0.577h-0.736v1.147h0.736zM20.413 15.001h-1.215l-1.16-1.776h-0.026v1.776h-1.056l-0.378-0.917h-2.028l-0.369 0.917h-1.333l1.993-4.865h1.641l1.804 4.403v-4.403h1.768l1.050 1.603 0.978-1.603h1.783v4.865h-1.109v-3.740h-0.025l-1.275 2.098h-0.883zM17.183 8.58l-0.663 1.675h1.373l-0.71-1.675zM14.398 10.76l0.616-1.782-0.026-0.002-1.468 3.59h-0.577l-1.47-3.588h-0.025l0.616 1.782h-0.908l-0.438-1.076h-2.339l-0.453 1.076h-1.059l1.94-4.866h1.684l1.85 4.575v-4.575h1.855l1.319 2.882 1.207-2.882h1.823v4.866h-1.049v-3.747h-0.023l-1.361 2.212h-0.911zM8 8.317l-0.88-2.086h-0.025v2.086h-1.043v-2.667h1.599l0.805 1.892 0.807-1.892h1.598v2.667h-1.042v-2.086h-0.026l-0.88 2.086h-0.907zM16.988 13.764l-0.766-1.772h-0.023l0.118 1.772h-2.32v-0.595h-2.586l-0.149 0.595h-1.278c-0.562 0-1.293-0.127-1.712-0.542-0.428-0.425-0.481-1.002-0.481-1.482 0-0.439 0.053-1.046 0.506-1.482 0.293-0.271 0.743-0.419 1.283-0.419h0.904v1.017h-0.874c-0.201 0-0.33 0.028-0.456 0.164-0.105 0.116-0.178 0.32-0.178 0.562 0 0.244 0.095 0.439 0.21 0.544 0.103 0.106 0.254 0.146 0.422 0.146h0.544l1.699-2.433h1.77l2.037 2.91v-2.91h1.752l1.018 2.113 0.932-2.113h1.783v4.865h-1.118v-3.329h-0.023l-1.354 3.329h-0.937zM11.637 12.673h1.564l-0.855-1.228-0.783 1.119-0.052 0.109h0.126z"/>
        </svg>
      </div>
      
      {/* UnionPay */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <rect x="1" y="6" width="22" height="12" rx="2" fill="#0D6AB7"/>
          <rect x="1" y="10" width="7" height="8" fill="#D42E2E"/>
          <rect x="8" y="10" width="7" height="8" fill="#1FA346"/>
          <rect x="15" y="10" width="8" height="8" fill="#F9AC1D"/>
          <path d="M3 14 H6 V15 H3 V14" fill="white"/>
          <path d="M10 14 H13 V15 H10 V14" fill="white"/>
          <path d="M17 14 H20 V15 H17 V14" fill="white"/>
        </svg>
      </div>
      
      {/* PayPal */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#003087">
          <path d="M7.076 21.337H2.47a.389.389 0 0 1-.392-.356L.006 2.859A.389.389 0 0 1 .394 2.5h8.233c2.74 0 4.75.65 6.075 1.959 1.281 1.281 1.773 2.934 1.466 4.925-.307 1.991-1.359 3.593-2.975 4.52-1.616.927-3.763 1.406-6.482 1.406h-2.93a.39.39 0 0 0-.39.354l-1.027 6.028a.389.389 0 0 1-.391.354l-5.027.25a.466.466 0 0 0 .13.041zm4.413-9.433c2.83 0 4.694-.52 6.084-1.591 1.39-1.072 2.229-2.76 2.229-5.046 0-1.548-.514-2.767-1.535-3.594C17.247 1.044 15.635.5 13.259.5H5.568a.773.773 0 0 0-.771.686L2.704 15.433a.778.778 0 0 0 .77.904h4.207a.778.778 0 0 0 .771-.686l.456-2.683a.778.778 0 0 1 .77-.686h1.813zm10.365-2.93c-.33 2.096-1.543 3.784-3.324 4.785-1.782 1-4.163 1.483-7.182 1.483h-1.668a.38.38 0 0 0-.379.329l-1.09 6.288a.38.38 0 0 1-.38.329h-3.841a.38.38 0 0 1-.38-.431l1.804-11.419a.765.765 0 0 1 .755-.665h5.847c3.457 0 4.478-.815 4.865-1.29.387-.473.588-1.284.588-2.566 0-.867-.142-1.424-.473-1.707-.33-.284-1.017-.544-2.588-.544H9.736a.764.764 0 0 0-.756.665L7.184 12.44a.38.38 0 0 1-.38.329H2.962a.38.38 0 0 1-.38-.43L4.386 1.92A.765.765 0 0 1 5.14 1.256h8.777c1.815 0 3.183.433 4.154 1.185.971.752 1.455 1.816 1.455 3.29 0 1.6-.223 2.807-.671 3.644-.448.838-1.057 1.334-1.809 1.6h.05c1.744 0 2.738.461 3.324 1.383.586.923.731 2.31.444 4.153v.41l-.137.858-.038.224-.101.634z"/>
        </svg>
      </div>
      
      {/* Apple Pay */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path d="M7.078 5.396c.381-.6.571-1.121.571-1.886-.552.03-1.221.368-1.622.833-.354.41-.667.996-.667 1.771.614.05 1.232-.32 1.718-.718zm1.86 5.772c-.599.878-1.222 1.75-2.19 1.75-.958 0-1.264-.565-2.36-.565-1.11 0-1.416.55-2.332.55-2.424 0-4.056-4.138-4.056-6.51v-.465c0-1.52.599-2.942 1.62-3.794C.66 2.494 1.995 2.134 3.077 2.134c.982 0 1.802.58 2.424.58.597 0 1.529-.595 2.687-.595.433 0 1.997.059 2.937.985-2.574 1.009-2.195 3.68.19 5.09-.401.705-.874 1.38-1.377 1.973z" fill="#000000"/>
          <path d="M18.375 16.805c.387 0 .738.046.974.134v-3.178l.002-.03c.007-.137.02-.27.043-.396l.003-.017c.046-.268.11-.469.192-.606l.013-.022c.162-.255.487-.434.973-.535v-.25c-.82 0-1.355.518-1.608 1.005a6.32 6.32 0 0 0-.36.855 6.772 6.772 0 0 0-.188.801c-.021.12-.038.242-.052.368l-.002.038v1.833zm-6.49.134c.235-.088.586-.134.973-.134v-1.833l-.002-.037a5.505 5.505 0 0 0-.052-.369 6.662 6.662 0 0 0-.188-.8 6.31 6.31 0 0 0-.36-.855c-.253-.488-.789-1.006-1.608-1.006v.25c.486.1.81.28.973.535l.013.022c.081.137.146.338.192.607l.003.016c.023.127.036.26.043.396l.001.031v3.177zm12.614-.07c0 .332-.12.589-.359.77-.238.18-.57.27-.996.27-.408 0-.74-.089-.995-.266-.256-.177-.384-.428-.384-.752 0-.304.144-.542.43-.716.146-.083.37-.144.673-.183-.12-.049-.209-.097-.267-.144-.145-.115-.217-.274-.217-.478 0-.376.308-.564.925-.564h.215l-.12-.09c-.126-.094-.21-.176-.253-.247a.451.451 0 0 1-.064-.233c0-.126.062-.236.186-.33.124-.093.291-.14.503-.14.423 0 .635.154.635.462a.431.431 0 0 1-.062.228c-.4.066-.126.144-.258.235a8.67 8.67 0 0 0-.473.341c.137.078.37.193.7.343.33.15.55.253.662.308.111.056.22.133.328.232.107.099.16.208.16.327zm-6.124.967V10.088h1.725v.38H19.35v6.988h1.502v.38h-3.753v-.38h1.276zm-6.49 0V10.088h1.725v.38h-1.25v6.988h1.502v.38h-3.753v-.38h1.276zm8.937-1.066c.221 0 .394-.059.52-.176.125-.118.188-.275.188-.473a.81.81 0 0 0-.083-.366c-.055-.111-.144-.216-.267-.317a8.074 8.074 0 0 0-.54-.351c-.31-.174-.532-.325-.668-.455-.135-.13-.203-.31-.203-.54 0-.22.08-.401.243-.544.162-.143.356-.214.581-.214.138 0 .262.027.373.082.11.055.196.13.256.225.6.096.089.186.089.269 0 .074-.024.136-.073.187a.24.24 0 0 1-.18.075c-.072 0-.13-.02-.175-.063a.22.22 0 0 1-.066-.164.36.36 0 0 1 .027-.14.396.396 0 0 0 .032-.148c0-.099-.034-.173-.1-.223-.066-.05-.146-.075-.237-.075-.188 0-.34.058-.463.173-.122.116-.183.27-.183.461 0 .235.092.42.277.554.069.05.205.139.409.267.204.128.357.223.458.288.101.065.18.12.239.17.147.123.253.243.316.358.064.115.096.248.096.399 0 .225-.068.413-.204.563-.137.15-.333.226-.59.226-.266 0-.475-.093-.627-.28-.151-.186-.227-.426-.227-.718v-.075h.38v.075c0 .195.032.358.096.487.065.13.175.194.33.194zM15.28 9.545l-2.067.01h-.093l-.059.071c-.38.46-.882.991-1.252 1.273a3.115 3.115 0 0 1-1.319.595l-.248.053.047.25c.238 1.236.992 2.25 2.112 2.83a3.294 3.294 0 0 0 1.365.294h.003c.196 0 .385-.02.571-.054v.383c-.189.041-.395.062-.611.062a3.69 3.69 0 0 1-1.481-.306c-.444-.196-.85-.486-1.217-.868a3.89 3.89 0 0 1-.891-1.421 3.97 3.97 0 0 1-.262-1.376 4.2 4.2 0 0 1 .349-1.604l.05-.119.5-.143c.043-.123.092-.242.147-.356.099-.206.213-.4.339-.58l.119-.17h3.184l.014-.391c0-.025-.003-.05-.005-.075l-.005-.058zm8.165 7.79c-.116 0-.222-.023-.317-.069a.585.585 0 0 1-.232-.205c-.22.095-.077.173-.162.235-.84.061-.188.092-.31.092-.123 0-.227-.03-.31-.092a.517.517 0 0 1-.167-.232.84.84 0 0 1-.058-.309c0-.153.04-.282.122-.385.081-.103.198-.154.35-.154.116 0 .21.027.28.082.07.054.106.123.106.207a.19.19 0 0 1-.042.12.133.133 0 0 1-.112.054.132.132 0 0 1-.103-.046.17.17 0 0 1-.04-.117c0-.059.034-.101.103-.126a.273.273 0 0 0-.066-.008c-.14 0-.245.064-.314.19a.429.429 0 0 0-.057.213c0 .115.033.205.097.27.64.065.14.097.228.097.134 0 .241-.048.32-.145.02-.024.04-.053.059-.089l.067-.128h.142a.891.891 0 0 0 .053.228.253.253 0 0 0 .1.114c.045.029.103.043.175.043.098 0 .174-.036.23-.109a.447.447 0 0 0 .082-.276c0-.176-.046-.33-.137-.461-.092-.131-.253-.285-.483-.46-.24-.185-.4-.334-.48-.447a.715.715 0 0 1-.12-.392.63.63 0 0 1 .225-.487c.15-.128.326-.192.527-.192.124 0 .23.029.317.086.87.058.15.132.189.223.38.09.058.172.058.244 0 .062-.024.116-.072.163a.226.226 0 0 1-.17.069.217.217 0 0 1-.163-.066.215.215 0 0 1-.064-.154c0-.095.05-.18.15-.253-.066-.08-.142-.12-.228-.12-.11 0-.2.039-.27.116a.392.392 0 0 0-.106.277c0 .199.242.475.729.827.237.175.398.32.481.435.84.116.126.255.126.42 0 .197-.057.356-.169.475-.112.12-.255.18-.428.18zm-14.306.064c-.298 0-.537-.12-.717-.362-.18-.242-.27-.585-.27-1.03v-1.2h.381v1.2c0 .334.06.59.183.77.122.18.287.271.495.271.208 0 .366-.09.476-.272.109-.18.164-.437.164-.769v-1.2h.38v1.2c0 .445-.093.788-.277 1.03-.184.241-.433.362-.745.362zm-1.369 0c-.242 0-.451-.072-.629-.216a1.294 1.294 0 0 1-.381-.562 2.155 2.155 0 0 1-.129-.741c0-.455.102-.82.307-1.094.204-.274.476-.41.816-.41.242 0 .45.071.626.214.174.142.304.335.387.58a2.11 2.11 0 0 1 .123.723c0 .454-.101.818-.305 1.092-.203.276-.475.414-.815.414zm18.727-2.428c-.145 0-.247.034-.307.101-.6.067-.089.16-.089.277 0 .119.035.233.105.344.069.11.165.22.288.329.122.108.222.2.298.275.77.076.115.183.115.32 0 .138-.05.25-.148.334-.1.084-.221.126-.365.126-.136 0-.236-.036-.3-.107a.437.437 0 0 1-.095-.298V16.3h-.074v.144c0 .152.044.277.131.375.087.098.211.148.372.148.178 0 .327-.057.446-.169.12-.113.179-.253.179-.422 0-.17-.05-.315-.148-.434a2.744 2.744 0 0 0-.347-.327c-.093-.078-.17-.143-.229-.196a.926.926 0 0 1-.143-.163.614.614 0 0 1-.087-.332c0-.13.034-.236.1-.318.068-.081.16-.122.28-.122.106 0 .188.033.246.1a.381.381 0 0 1 .087.257v.103h.074v-.117c0-.13-.04-.237-.122-.321-.082-.084-.19-.127-.324-.127zm-19.46.106c-.252 0-.44.11-.564.33-.124.22-.187.508-.187.862 0 .22.028.422.085.604.057.182.143.324.258.425.116.102.256.152.42.152.25 0 .438-.109.561-.328.123-.22.185-.507.185-.862 0-.228-.028-.43-.084-.61a.985.985 0 0 0-.261-.419.645.645 0 0 0-.413-.154z" fill="#000000"/>
        </svg>
      </div>
      
      {/* Google Pay */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="32" height="28">
          <path d="M22.285 10.38h-9.245v3.24h5.308c-.498 2.451-2.549 3.891-5.308 3.891-3.238 0-5.858-2.69-5.858-6 0-3.31 2.62-6 5.858-6 1.44 0 2.843.551 3.908 1.578L19.74 4.374C17.89 2.6 15.758 1.6 13.04 1.6 7.903 1.6 3.752 5.828 3.752 11c0 5.172 4.151 9.4 9.288 9.4 4.729 0 9-3.398 9-8.4 0-.529-.089-1.084-.227-1.62z" fill="#4285F4"/>
          <path d="M3.752 11c0-5.172 4.151-9.4 9.288-9.4 2.718 0 4.85.999 6.7 2.774l2.691-2.715C20.149 3.043 17.466 1.6 13.04 1.6 7.903 1.6 3.752 5.828 3.752 11z" transform="translate(0 2)" fill="#34A853"/>
          <path d="M3.752 11c0-5.172 4.151-9.4 9.288-9.4 2.718 0 4.85.999 6.7 2.774l2.691-2.715C20.149 3.043 17.466 1.6 13.04 1.6 7.903 1.6 3.752 5.828 3.752 11z" transform="translate(0 -2)" fill="#EA4335"/>
          <path d="M0 1.6h4.8v19.2H0z" transform="translate(0 2)" fill="none"/>
          <path d="M3.752 11c0 5.172 4.151 9.4 9.288 9.4 4.729 0 9-3.398 9-8.4 0-.529-.089-1.084-.227-1.62H13.04v3.24h5.308c-.498 2.451-2.549 3.891-5.308 3.891-3.238 0-5.858-2.69-5.858-6z" transform="translate(0 2)" fill="#FBBC05"/>
        </svg>
      </div>
      
      {/* WeChat Pay */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#07C160">
          <path d="M9.817 10.642a.553.553 0 01-.542-.561.553.553 0 01.542-.561c.365 0 .66.252.66.561 0 .31-.295.561-.66.561zm-3.542 0a.553.553 0 01-.542-.561.553.553 0 01.542-.561c.365 0 .66.252.66.561 0 .31-.296.561-.66.561zm12.858 3.795a.51.51 0 01-.506.513.51.51 0 01-.506-.513c0-.284.226-.513.506-.513s.506.23.506.513zm-3.033 0a.51.51 0 01-.506.513.51.51 0 01-.507-.513c0-.284.226-.513.507-.513.28 0 .506.23.506.513zm2.624-7.343c-3.141 0-5.717 2.13-5.717 4.911 0 2.7 2.453 4.911 5.717 4.911.638 0 1.26-.09 1.843-.244l1.7.848-.454-1.344c1.552-.964 2.628-2.509 2.628-4.171 0-2.782-2.576-4.911-5.717-4.911zm-8.864-.002c-3.524 0-6.378 2.375-6.378 5.44 0 1.905 1.151 3.623 2.946 4.651l-.508 1.506 1.91-.941c.652.172 1.32.266 2.03.266v-.84c-3.14 0-5.717-2.13-5.717-4.91 0-2.782 2.576-4.912 5.717-4.912 3.141 0 5.718 2.13 5.718 4.911v.841c0-.475-.079-.934-.218-1.368-.88-2.26-3.315-3.644-5.5-3.644z"/>
        </svg>
      </div>
      
      {/* Alipay */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#1677FF">
          <path d="M21.422 15.358c-4.393 1.774-7.919.398-9.873-.696 2.302-1.745 4.02-3.908 5.076-5.690h-9.137v-1.42h4.616v-1.42h-5.237v-1.42h5.237v-2.028l2.54-.002v2.03h5.398v1.42h-5.398v1.42h4.398c-.388 1.494-1.058 2.885-2.008 4.115 1.088.697 2.128 1.064 3.606 1.064.86 0 1.791-.136 2.783-.472v3.098zm1.8-8.709v12.118c0 2.426-1.171 2.813-2.588 2.856h-16.66C1.168 21.58 0 20.35 0 17.926V2.57C.044 1.153.432 0 2.859 0h16.659c2.426 0 3.656 1.166 3.612 2.57v4.079h.002zm-3.41 10.718c-1.264 1.41-3.112 1.8-4.333 1.8-3.96 0-5.569-2.76-6.26-4.14-3.34.74-6.093 1.99-6.093 4.43 0 1.8 1.172 4.33 5.437 4.33h8.227c1.8 0 4.876-.39 4.96-3.6-.217-1.09-.826-2.04-1.937-2.82z"/>
        </svg>
      </div>
      
      {/* Stripe */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#635BFF">
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
        </svg>
      </div>
    </div>
  );
};

// Flag component for displaying country flags
const Flag = ({ country, className }: { country: string, className?: string }) => {
  const countryToCode: Record<string, string> = {
    "USA": "US", "United States": "US",
    "Canada": "CA",
    "United Kingdom": "GB", "UK": "GB",
    "Spain": "ES",
    "France": "FR",
    "Germany": "DE",
    "Italy": "IT",
    "Ireland": "IE",
    "Vietnam": "VN",
    "Philippines": "PH",
    "Malaysia": "MY",
    "Thailand": "TH",
    "Singapore": "SG",
    "Indonesia": "ID",
    "Hong Kong": "HK"
  };
  
  const code = countryToCode[country] || "";
  
  return (
    <div className={cn("inline-block mr-2", className)}>
      {code && (
        <img 
          src={`https://flagcdn.com/24x18/${code.toLowerCase()}.png`}
          alt={`${country} flag`}
          className="h-4 inline-block"
        />
      )}
    </div>
  );
};

// Global office location component
const GlobalOffices = () => {
  const offices = {
    "North America": ["United States", "Canada"],
    "Europe": ["United Kingdom", "Spain", "France", "Germany", "Italy", "Ireland"],
    "Southeast Asia": ["Vietnam", "Philippines", "Malaysia", "Thailand", "Singapore", "Indonesia", "Hong Kong"]
  };
  
  return (
    <div className="space-y-4">
      {Object.entries(offices).map(([region, countries]) => (
        <div key={region}>
          <h4 className="font-medium mb-2 text-gray-100">{region}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {countries.map((country) => (
              <div key={country} className="text-gray-300 flex items-center">
                <Flag country={country} />
                <span>{country}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Footer = () => {
  const { t } = useTranslations();
  
  const usefulLinks: FooterLink[] = [
    { href: '/courses', label: t('navigation:allCourses'), translationKey: 'navigation:allCourses' },
    // FAQ link removed since it's now integrated into the homepage
  ];

  const { data: contactMethods = [] } = useQuery({
    queryKey: ["contact-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_methods")
        .select("*")
        .eq("is_active", true as any)
        .order("display_order");
      
      return handleContactMethodsQueryError(data, error);
    },
  });

  const getContactMethodValue = (type: string): string => {
    const method = contactMethods.find(m => m.type === type);
    return method ? method.value : '';
  };

  const email = getContactMethodValue('email') || 'secondrise@secondrise.com';
  const email2 = 'info@secondrise.com';
  const phone = getContactMethodValue('phone') || '+852 1234 5678';
  const address = getContactMethodValue('address') || 'Hong Kong';
  const whatsapp1 = "+85298211389";
  const whatsapp2 = "+1(202)2099688";

  return (
    <footer className="text-white" style={{ backgroundColor: '#262626' }}>
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Company & Brand */}
          <div className="md:col-span-3">
            <div className="flex items-center mb-4">
              <Logo />
            </div>
            <p className="text-gray-300 mb-4">
              SecondRise - {t('common:ecommerceEducationPlatform')}
            </p>
            <p className="text-gray-400 text-sm mb-2">
              Mandarin (Hong Kong) International Limited
            </p>
            <div className="flex items-center space-x-4 mt-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
            
            {/* Payment Methods */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gray-300">
                Accepted Payment Methods
              </h3>
              <PaymentIcons />
            </div>
          </div>
          
          {/* Quick Links & Resources */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">{t('common:quickLinks')}</h3>
            <ul className="space-y-2">
              {usefulLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a 
                      href={link.href} 
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t(link.translationKey)}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  ) : (
                    <Link to={link.href} className="text-gray-300 hover:text-white transition-colors">
                      {t(link.translationKey)}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link to="/terms-of-use" className="text-gray-300 hover:text-white transition-colors">
                  {t('common:termsOfUse')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                  {t('common:privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-gray-300 hover:text-white transition-colors">
                  {t('common:cookiePolicy')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold mb-4">{t('common:contactUs')}</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2 opacity-0" />
                <a href={`mailto:${email2}`} className="hover:text-white transition-colors">{email2}</a>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">{phone}</a>
              </div>
              <div className="flex items-center text-gray-300">
                <MessageSquare className="h-4 w-4 mr-2" />
                <a href={`https://wa.me/${whatsapp1.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp: {whatsapp1}
                </a>
              </div>
              <div className="flex items-center text-gray-300">
                <MessageSquare className="h-4 w-4 mr-2 opacity-0" />
                <a href={`https://wa.me/${whatsapp2.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp: {whatsapp2}
                </a>
              </div>
              <div className="flex items-start text-gray-300">
                <MapPin className="h-4 w-4 mr-2 mt-1" />
                <span>{address}</span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gray-300">
                {t('common:language')}
              </h3>
              <LanguageSwitcher />
            </div>
          </div>
          
          {/* Global Offices */}
          <div className="md:col-span-4">
            <h3 className="text-lg font-semibold mb-4">Global Offices</h3>
            <GlobalOffices />
          </div>
        </div>
        
        {/* Copyright Row */}
        <div className="border-t border-gray-700/50 mt-10 pt-6">
          <div className="flex flex-col md:flex-row md:justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} SecondRise. Mandarin (Hong Kong) International Limited. {t('common:allRightsReserved')}</p>
            <div className="flex items-center space-x-4">
              <Link to="/terms-of-use" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('common:termsOfUse')}
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('common:privacyPolicy')}
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/cookie-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('common:cookiePolicy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
