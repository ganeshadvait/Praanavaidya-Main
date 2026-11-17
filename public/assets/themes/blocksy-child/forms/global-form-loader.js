(function () {
    'use strict';

    const APPS_SCRIPT_URL =
        'https://script.google.com/macros/s/AKfycbwq7y_yrRp5eQ8yBi6oQqfNJ_utptbw9LymT_JjjjhjPaDBdnmaemGQ7Tuex5kWEuuKfw/exec';

    function initialiseAppointmentForm() {
        const form = document.getElementById('simpleGlobalForm');

        if (!form || form.dataset.formInitialised === 'true') {
            return;
        }

        form.dataset.formInitialised = 'true';

        const countryDropdown =
            document.getElementById('countryDropdown');

        const countryMenu =
            document.getElementById('countryMenu');

        const dropdownArrow =
            document.getElementById('dropdownArrow');

        const selectedFlag =
            document.getElementById('selectedFlag');

        const selectedCode =
            document.getElementById('selectedCode');

        const countryCode =
            document.getElementById('countryCode');

        const submitButton =
            document.getElementById('simpleSubmit');

        const submitText =
            document.getElementById('submitText');

        const submitLoader =
            document.getElementById('submitLoader');

        const successBox =
            document.getElementById('simpleSuccess');

        const successMessage =
            document.getElementById('successMsg');

        const errorBox =
            document.getElementById('simpleError');

        const errorMessage =
            document.getElementById('errorMsg');

        function hideMessage(element) {
            if (!element) {
                return;
            }

            element.classList.add('hidden');
            element.style.setProperty('display', 'none', 'important');
        }

        function showMessage(element) {
            if (!element) {
                return;
            }

            element.classList.remove('hidden');
            element.style.setProperty('display', 'flex', 'important');
        }

        function resetCountry() {
            if (selectedFlag) {
                selectedFlag.textContent = '🇮🇳';
            }

            if (selectedCode) {
                selectedCode.textContent = '+91';
            }

            if (countryCode) {
                countryCode.value = '+91';
            }
        }

        function setLoading(isLoading) {
            if (submitButton) {
                submitButton.disabled = isLoading;
            }

            if (submitText) {
                submitText.style.display =
                    isLoading ? 'none' : 'inline';
            }

            if (submitLoader) {
                submitLoader.style.display =
                    isLoading ? 'inline-flex' : 'none';
            }
        }

        function resetFormDisplay(clearFields) {
            hideMessage(successBox);
            hideMessage(errorBox);
            setLoading(false);

            if (clearFields) {
                form.reset();
                resetCountry();
            }
        }

        function openCountryMenu() {
            if (!countryMenu) {
                return;
            }

            countryMenu.classList.remove(
                'opacity-0',
                'invisible',
                'scale-95'
            );

            countryMenu.classList.add(
                'opacity-100',
                'visible',
                'scale-100'
            );

            if (dropdownArrow) {
                dropdownArrow.classList.add('rotate-180');
            }
        }

        function closeCountryMenu() {
            if (!countryMenu) {
                return;
            }

            countryMenu.classList.add(
                'opacity-0',
                'invisible',
                'scale-95'
            );

            countryMenu.classList.remove(
                'opacity-100',
                'visible',
                'scale-100'
            );

            if (dropdownArrow) {
                dropdownArrow.classList.remove('rotate-180');
            }
        }

        resetFormDisplay(false);

        if (countryDropdown && countryMenu) {
            countryDropdown.addEventListener(
                'click',
                function (event) {
                    event.stopPropagation();

                    if (
                        countryMenu.classList.contains('invisible')
                    ) {
                        openCountryMenu();
                    } else {
                        closeCountryMenu();
                    }
                }
            );
        }

        document
            .querySelectorAll('.country-option')
            .forEach(function (option) {
                option.addEventListener(
                    'click',
                    function () {
                        const code =
                            this.getAttribute('data-code');

                        const flag =
                            this.getAttribute('data-flag');

                        if (selectedCode) {
                            selectedCode.textContent = code;
                        }

                        if (selectedFlag) {
                            selectedFlag.textContent = flag;
                        }

                        if (countryCode) {
                            countryCode.value = code;
                        }

                        closeCountryMenu();
                    }
                );
            });

        document.addEventListener(
            'click',
            function (event) {
                if (
                    countryDropdown &&
                    countryMenu &&
                    !countryDropdown.contains(event.target) &&
                    !countryMenu.contains(event.target)
                ) {
                    closeCountryMenu();
                }

                /*
                 * Clear old success/error messages whenever
                 * the appointment modal is opened.
                 */
                if (event.target.closest('.open-modal')) {
                    resetFormDisplay(true);
                }
            }
        );

        form.addEventListener(
            'submit',
            async function (event) {
                event.preventDefault();

                hideMessage(successBox);
                hideMessage(errorBox);

                const fullNameField =
                    form.querySelector('[name="full_name"]');

                const phoneField =
                    form.querySelector('[name="phone_number"]');

                const emailField =
                    form.querySelector(
                        '[name="email"], input[type="email"]'
                    );

                const messageField =
                    form.querySelector(
                        '[name="message"], textarea'
                    );

                const fullName = fullNameField
                    ? fullNameField.value.trim()
                    : '';

                const phoneNumber = phoneField
                    ? phoneField.value.trim()
                    : '';

                const email = emailField
                    ? emailField.value.trim()
                    : '';

                const message = messageField
                    ? messageField.value.trim()
                    : '';

                const selectedCountryCode = countryCode
                    ? countryCode.value.trim()
                    : '+91';

                if (!fullName || !phoneNumber) {
                    if (errorMessage) {
                        errorMessage.textContent =
                            'Please enter your name and phone number.';
                    }

                    showMessage(errorBox);
                    return;
                }

                setLoading(true);

                const formData = new URLSearchParams();

                /*
                 * This shortcode is the Book Appointment popup.
                 * Do not detect this from the current page URL.
                 */
                formData.append(
                    'form_type',
                    'book_appointment'
                );

                formData.append(
                    'full_name',
                    fullName
                );

                formData.append(
                    'country_code',
                    selectedCountryCode
                );

                formData.append(
                    'phone_number',
                    phoneNumber
                );

                formData.append(
                    'email',
                    email
                );

                formData.append(
                    'message',
                    message
                );

                formData.append(
                    'page_url',
                    window.location.href
                );

                try {
                    await fetch(
                        APPS_SCRIPT_URL,
                        {
                            method: 'POST',
                            mode: 'no-cors',
                            body: formData
                        }
                    );

                    form.reset();
                    resetCountry();

                    if (successMessage) {
                        successMessage.textContent =
                            'Thank you. Your details have been submitted successfully.';
                    }

                    showMessage(successBox);

                } catch (error) {
                    if (errorMessage) {
                        errorMessage.textContent =
                            'Unable to submit your details. Please try again.';
                    }

                    showMessage(errorBox);

                } finally {
                    setLoading(false);
                }
            }
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initialiseAppointmentForm
        );
    } else {
        initialiseAppointmentForm();
    }
})();