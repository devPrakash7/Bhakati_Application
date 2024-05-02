module.exports = {

    'USER': {
        signUp_success: 'User signUp successfully.',
        login_success: 'Login successfully.',
        social_login_success: 'Social login successfully.',
        logout_success: 'Logout successfully.',
        logout_fail: 'Error while logging you out.',
        resetPassword_success: 'Your password has been updated successfully.',
        forgotPassword_success: 'Your password has been updated successfully.',
        userDetail_not_available: 'User details not available at this time.',
        invalidOldPassword: 'Please enter a valid old password.',
        passwordMinLength: 'Your password must contain at least 6 characters.',
        passwordUpdate_success: 'Your password successfully changed.',
        profile_fetch_success: 'Profile fetch successfull.',
        profile_update_success: 'Profile updated successfully.',
        email_not_found: 'Username/Email is not registered.',
        forgotPassword_email_success: 'Please check your email to reset password.',
        resend_email_success: 'Resend mail send successfully.',
        forgotPassword_email_fail: 'Error while sending link.',
        resetPassword_token_success: 'Token varified.',
        resetPassword_token_fail: 'Token expired.',
        password_update_fail: 'Error while updating password.',
        set_new_password_fail: 'Your link has been expired.',
        set_new_password_success: 'Your password has been reset successfully.',
        user_name_already_exist: 'This username has already been taken. Please enter a different username.',
        email_already_exist: 'Email already in use.',
        delete_account: 'Your account is deleted.',
        not_verify_account: 'Please verify your account.',
        deactive_account: 'Your account is deactivated by administrator.',
        inactive_account: 'Your account is deactivated by administrator.',
        account_verify_success: `Your account has been verified successfully. Please click 'Continue' in the app to proceed.`,
        account_verify_fail: 'Your account verify link expire or invalid.',
        password_mismatch: 'New password and confirm password not matched.',
        invalid_username_password: "Invalid email or password.",
        invalid_password: "Invalid password.",
        user_data_retrieved_success: 'User data retrieved successfully.',
        user_activation: 'User activated successfully.',
        user_inactivation: 'User inactivated successfully.',
        user_deactivate: 'User deactivated successfully.',
        user_details_not_available: 'User details not available.',
        get_user_profile: 'User profile get profile.',
        user_deleted: 'User deleted successfully.',
        get_user_notificatuon_setting: 'User notification setting details.',
        update_user_notificatuon_setting: 'User notification setting details update successfully.',
        not_found: 'User not found, Please sign up.',
        get_user_skill_message: "get user skill message successfully.",
        logout_success: "Logout successfully.",
        account_already_verify: "Account alredy verify",
        fbid_required: 'facebook ID is required.',
        get_user_auth_token: 'get new auth tokens',
        existingEmail: 'this email is alreday existing',
        no_image_upload: 'no such image uploaded to the server',
        opt_verify: 'Your otp is verified successfully',
        otp_not_matched: 'Your otp does not match',
        delete_account: 'successfully delete this account',
        already_updated: 'Your account already updated',
        not_verify: 'Your not verified Please verify your account',
        update_device_token: 'successfully updated device token',
        update_user_profile_image: 'successfully update the user profile image',

    },

    'GENERAL': {

        general_error_content: 'Something went wrong. Please try again later.',
        unauthorized_user: 'Unauthorized, please login.',
        invalid_user: 'You are not authorized to do this operation.',
        invalid_login: 'You are not authorized.',
        blackList_mail: `Please enter a valid email, we don't allow dummy emails.`,
        token_expired: 'this token is invalid or expired'
    },
    'BOOKING': {
        create_new_slot: 'successfully created the slots',
        booking_slot: 'user successfully booking',
        not_found: 'bookings data not found',
        get_all_booking: 'successfully get all booking slots',
        get_all_temples: 'successfully get all booking temples',
        booking_downlod: 'successfully downloading this booking slot',
        slots_not_found: 'currently no slots are available',
        already_booked_slot: 'This slot already booked please booked another slot',
        update_slots: 'successfully update this slot',
        slot_not_found: 'slot data found',
        get_all_the_slot: "successfully get all the slots",
        booked_list: "successfully get all the booked list",
        delete_slots: 'successfully delete this slot',
        temple_under_booking_list:'successfully get all the temple under booking list'

    },
    'TEMPLE': {
        addTemple: 'successfully add a new temple',
        not_found: 'temples or guru are not found',
        get_all_temples: 'successfully get all temples',
        delete_temples: 'successfully delete this temple',
        already_delete_temples: 'this temple is already deleted',
        temple_login: 'temple or guru login sucessfully',
        email_already_exist: 'email already exists',
        logout_success: 'temple or guru logout succesfully',
        get_temple_profile: 'successfully get the temple profile',
        add_bank_details: 'successfully add bank details',
        bank_details_not_found: 'this bank detail is not found',
        get_bankDetils: 'successfully get the bank details',
        add_pandit_details: 'successfully add pandit details',
        email_already_exist: 'this email already exists',
        not_found_pandit: 'pandit details are not found',
        get_pandit_details: 'successfully get the pandit details',
        update_pandit_details: 'successfully update the pandit details',
        delete_pandit_details: 'successfully delete the pandit details',
        Live_stream_not_found: 'This temple was not live',
        update_bank_details: 'successfully update the bank details',
        delete_bank_details: 'successfully delete the bank details',
        temple_under_pandit_data_not_found: 'this temple under pandit was not registered',
        already_added_bank_details: 'Your bank details already exist can not be added another bank details',
        update_temple_profile: 'successfully update the temple profile',
        temple_not_found: 'this temple data was not found',
        get_all_bank_details: 'successfully get all the bank details',
        update_temple_profile_image: 'successfully update the temple profile image'
    },

    'LIVESTREAM': {

        create_new_live_stream_video: 'successfully created a new live streaming video',
        get_all_live_streams_by_puja: 'successfully get all live streams by puja',
        get_all_live_streams_by_rithuals: 'successfully get all live streams by rithuals',
        delete_live_streams: 'successfully delete live streaming',
        not_found_streams: 'muxdata was not found',
        not_found: 'This LiveStream data was not found in the database'
    },
    'PUJA': {
        add_new_puja: 'successfully added a new puja',
        not_found: 'currently no puja found',
        get_all_puja: 'successfully get all puja',
        update_puja: 'successfully update puja',
        add_new_rithuals: 'successfully add new rithuals',
        Invalid_page: 'Invalid page or limit values.',
        get_all_rithuals: 'successfully get all rithuals',
        temple_under_pujaList: 'temple under all the puja list',
        delete_rihuals: 'successfully delete the rihuals',
        delete_puja: 'successfully delete the puja',
        update_puja: 'successfully update the puja'

    },
    'GURU': {
        add_new_guru: 'successfully add new guru',
        existing_email: 'this email is already existing',
        guru_login_success: 'guru login successfully',
        guru_not_found: 'guru was not found',
        guru_logout: 'guru logout successfully',
        get_all_gurus: 'successfully get all the gurus information',
        get_guru_profile: 'successfully get the guru profile',
        guru_live_stream_created: 'successfully create a new live stream',
        get_all_LiveStream: 'successfully get all the Live Stream',
        get_Live_Stream_By_Guru: 'successfully get all the Live stream',
        guru_successfully_upload_new_video: 'successfully upload a new video',
        get_all_videos: 'successfylly get all the videos',
        not_found: 'videos data was not found',
        get_videos: 'successfully get this video',
        get_total_views: 'successfully get all the views',
        get_all_the_suggested_videos: 'successfully get all the suggested videos',
        delete_guru: 'successfully delete the guru',
        update_guru: 'successfully update the guru profile',
        upload_image: "No image has uploading please upload both image first"
    }
}