import React, {useState} from 'react';
import type {ComponentType} from 'react';
import {useIntl} from 'react-intl';
import {useLocation, useHistory} from 'react-router-dom';
import {parse} from 'query-string';

import {useToast, useStoreConfigQuery} from '@luft/common';
import {RegisterComponent, useRegisterMutation} from '@luft/user';
import type {RegisterInput} from '@luft/types';
import messages from '@luft/user/src/components/Register.container/resources/messages';

import {useExtractDobFromNationalIdLazyQuery} from 'bat-core/restrict-access';
import {useStorage} from 'bat-core/common';
import {trackRegistration, trackNewsletter} from 'bat-core/data-layer';
import {getReferralManager} from 'bat-core/user';
import custom_messages from 'bat-core/user/src/components/Register.container/resources/messages';

import type {Viewer} from 'bat-core/types';

type Props = {
    as?: ComponentType<{}>,
    registrationUrl?: string,
    registerInput?: RegisterInput,
    referralCode?: string,
    isEmailPredefined?: boolean,
    onRegister: ({register: Viewer}) => void
};

const DEFAULT_BACK_URL = '/account';

export function RegisterContainer(props: Props) {
    const {pathname, search, state = {}} = useLocation();
    const {getCode, clearCode} = getReferralManager();

    const {
        as: Component = RegisterComponent,
        registrationUrl,
        onRegister,
        registerInput = {},
        referralCode = getCode(pathname),
        isEmailPredefined = false,
        ...other
    } = props;

    const m = useRegisterMutation();
    const {formatMessage} = useIntl();
    const addToast = useToast();
    const history = useHistory();
    const q = useStoreConfigQuery();
    const extractDobQuery = useExtractDobFromNationalIdLazyQuery();
    const {getValue: getDobValue} = useStorage({key: 'dob'});

    const [isReferralFieldReadOnly, setIsReferralFieldReadOnly] = useState(!!referralCode);

    const [registerMutation, {data, loading, error}] = m;
    const [
        extractDobFromNationalId,
        {data: extractDobData}
    ] = extractDobQuery;
    const {socialName, socialRegisterInput, from} = state;
    const {social_register} = parse(search);
    const account = data?.register?.user;
    const dob = extractDobData?.extractDobFromNationalId?.dob || getDobValue();
    const isSocialRegister = social_register === 'true' && !!socialRegisterInput;
    const isReferralProgramEnabled = q.data?.storeConfig?.is_referral_program_enabled;
    const isEnabledSubscription = q.data?.storeConfig?.enable_subscription;
    const isAzureEnabled = q.data?.storeConfig?.is_azure_enabled;
    const isEnabledDobAutocomplete = q.data?.storeConfig?.is_enabled_dob_autocomplete;
    const isShowOfflinePickupOptions = q.data?.storeConfig?.is_show_offline_pickup_options;
    const freeDevicePickupOptions = q.data?.storeConfig?.free_device_pickup_option;
    const freeDevicePickupLabel = q.data?.storeConfig?.free_device_pickup_option_attr_label;
    const minimumPasswordLength = q.data?.storeConfig?.customer_minimum_password_length;
    const passwordRequiredClassesCount = q.data?.storeConfig?.password_required_character_classes_number;

    const handleRegister = async (input) => {
        try {
            const backUrl = from || DEFAULT_BACK_URL;
            const regUrl = registrationUrl ? {registration_url: registrationUrl} : {};

            const resp = await registerMutation({...input, back_url: backUrl, ...regUrl});
            const isConfirmedAccount = resp?.data?.register?.confirmed !== false;

            if (!isConfirmedAccount && !registrationUrl) {
                history.push('/account/login', {showAccountConfirmNotification: true, backUrl});
                return resp;
            }

            if (isSocialRegister) {
                const message = formatMessage(custom_messages.social_register_in_success, {social_name: socialName});

                addToast(message, 'success');
            } else {
                addToast(formatMessage(messages.registration_success), 'success');
            }

            if (onRegister) onRegister({...resp, isSocialRegister});
            trackRegistration('success');
            clearCode();

            const hasConsent = resp?.data?.register?.user?.consent;

            if (hasConsent) {
                trackNewsletter();
            }

            return resp;
        } catch {
            if (input.referral) {
                setIsReferralFieldReadOnly(false);
            }
        }
    };

    const handleExtractDobFromNationalId = (ktpId) => {
        extractDobFromNationalId({variables: {national_id: ktpId}});
    };

    return (
        <Component {...other}
                   m={m}
                   account={account}
                   isEnabledSubscription={isEnabledSubscription}
                   onRegister={handleRegister}
                   loading={loading}
                   error={error}
                   registerInput={{...registerInput, ...socialRegisterInput, ...(dob && {dob})}}
                   isEmailPredefined={isEmailPredefined}
                   isSocialRegister={isSocialRegister}
                   referralCode={isReferralProgramEnabled ? referralCode : ''}
                   isReferralFieldReadOnly={isReferralProgramEnabled && isReferralFieldReadOnly}
                   isAzureEnabled={isAzureEnabled}
                   onExtractDobFromNationalId={handleExtractDobFromNationalId}
                   isEnabledDobAutocomplete={isEnabledDobAutocomplete}
                   isShowOfflinePickupOptions={isShowOfflinePickupOptions}
                   devicePickupOptions={freeDevicePickupOptions}
                   devicePickupLabel={freeDevicePickupLabel}
                   minimumPasswordLength={minimumPasswordLength}
                   passwordRequiredClassesCount={passwordRequiredClassesCount}/>
    );
}
