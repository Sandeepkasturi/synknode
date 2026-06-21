import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: 'fceb4e337d7340139f8d4de7da43c7ac'
                    }
                    events_route: {
                        table: 'sys_ws_operation'
                        id: '9f53aec9cf03423bb0bfab9d6e0a1d63'
                    }
                    indicator_active_users: {
                        table: 'pa_indicators'
                        id: 'bd8beb2ab422457397babd824359fb5a'
                    }
                    indicator_average_transfer_duration: {
                        table: 'pa_indicators'
                        id: '818dba3801804d3db0f0f4e488a7284b'
                    }
                    indicator_completed_transfers: {
                        table: 'pa_indicators'
                        id: '8067bff6ddea4c37a16ee72b1bf59214'
                    }
                    indicator_daily_visits: {
                        table: 'pa_indicators'
                        id: 'f6cb150d24824a7cbd0ada1d9fca467d'
                    }
                    indicator_source_daily: {
                        table: 'pa_indicator_sources'
                        id: '3def069ce656483aa72b8dfede93573d'
                    }
                    indicator_total_data_transferred: {
                        table: 'pa_indicators'
                        id: 'cbd1cc0cc09044d1a574f66ffefb65ae'
                    }
                    indicator_total_page_visits: {
                        table: 'pa_indicators'
                        id: 'eede2d1583074a35b7738a1cc65fc565'
                    }
                    indicator_total_transfers: {
                        table: 'pa_indicators'
                        id: '09aa2f762d9442c88f447b37a45f1213'
                    }
                    indicator_transfer_success_rate: {
                        table: 'pa_indicators'
                        id: 'ea550bcca1c34a70bd188e20cfc613d9'
                    }
                    indicator_transfers_by_file_type: {
                        table: 'pa_indicators'
                        id: '2fd962ff75734ec389c5f120e4855435'
                    }
                    indicator_transfers_per_hour: {
                        table: 'pa_indicators'
                        id: '7c14be4229614f22970eea0a15f1c2af'
                    }
                    pa_dashboard: {
                        table: 'pa_dashboards'
                        id: 'e3befe6d156f4559ba853b8a5e6f1050'
                    }
                    pa_dashboard_permission_admin: {
                        table: 'pa_dashboards_permissions'
                        id: '774a4eb1691b4b689bd53418887d5f0a'
                    }
                    pa_dashboard_tab: {
                        table: 'pa_tabs'
                        id: 'd165136e7eb54d90b3d4a9ccdd4fb5c7'
                    }
                    pa_dashboard_tab_link: {
                        table: 'pa_m2m_dashboard_tabs'
                        id: '80a180da0b384f239c40550e6e0b90e1'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '3600eb9a68ab42e9bc51a40e3de9a190'
                    }
                    'src_server_events-handler_ts': {
                        table: 'sys_module'
                        id: 'b339fb36367a49a68fa6688d9cabe628'
                    }
                    'src_server_summary-handler_ts': {
                        table: 'sys_module'
                        id: '429cc5f891b9415498b2a5daeefc6391'
                    }
                    summary_route: {
                        table: 'sys_ws_operation'
                        id: 'fe622716df6747cebc6c4e5285d68382'
                    }
                    synknode_analytics_api: {
                        table: 'sys_ws_definition'
                        id: 'ba0a27447bab4e8b9e47a68e45f41a6b'
                    }
                    widget_active_users: {
                        table: 'pa_widgets'
                        id: '18226e4a481d47b3beaaeddca633f4d9'
                    }
                    widget_average_transfer_duration: {
                        table: 'pa_widgets'
                        id: 'a450eb0eb4e84082a83de85448092cdf'
                    }
                    widget_daily_visits: {
                        table: 'pa_widgets'
                        id: 'acadf5de401d4883bb3172a9f329431f'
                    }
                    widget_total_data_transferred: {
                        table: 'pa_widgets'
                        id: '8595269bf72f4731b0af55def86e1f26'
                    }
                    widget_total_page_visits: {
                        table: 'pa_widgets'
                        id: 'e37838dbe0cb4418b18b41f0490ee988'
                    }
                    widget_total_transfers: {
                        table: 'pa_widgets'
                        id: 'ddb9af1a87824006ae44655110bfaadd'
                    }
                    widget_transfer_success_rate: {
                        table: 'pa_widgets'
                        id: '68b31ac91be344a6b507943c9b45869c'
                    }
                    widget_transfers_by_file_type: {
                        table: 'pa_widgets'
                        id: 'c8b88ae5cedc4344ad37732c60bdfc56'
                    }
                    widget_transfers_per_hour: {
                        table: 'pa_widgets'
                        id: '7df9a67b21144ccbbedf6a3f0d6d765a'
                    }
                }
                composite: [
                    {
                        table: 'sys_documentation'
                        id: '03c17dfb42584700bfbcca690b345508'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'file_extension'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '11e8e72fa90c40f79687d97ef881e25e'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1d29b8d2950d4a7f9a769966f6a71775'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'transfer_status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '238edde5c4724e098a0810d341c0e090'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'timestamp'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '2635572358ee4d389b11e6aa5c109c9f'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2720513549ec477092ef14d17795496f'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'app_version'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '38910c7bd4d54c658c61b6bbf56a14a5'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'file_extension'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '39c2e373141f41b4824e251a6d694908'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'sender_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3e017efa040e40c9bc6fcdb585ad4158'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'app_version'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '40db6d48c2904a3d9b178dcd796faa16'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'file_name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '452513d75b56478a88a5da6c8bfd5d3b'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'session_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '46afad1d890c48758c21cedfa4a854bb'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'file_type'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '47ff10b7712d4ca39b202a971d317e9f'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'transfer_duration_ms'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '48037da81963461782eb264bcfd342c0'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'visit_url'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4a5bbbfd74714bdb97ed913121d78893'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'receiver_id'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4dc55ab528b9488eb7065cd1e5894b61'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'file_extension'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '55652626b1ee4dbd83fae4dc4699155c'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'size_bytes'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5bea81d156bb49a5b07b58835d3b041f'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'app_version'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5e40fb0f0fda4e4db00b3f64e57345f6'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'receiver_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5e8885b63d22416988ec343ae8409c48'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'visit_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6348c8775b8c467fb709d0f99efca4d6'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'session_id'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '65034767a25543188771b3639a5906e8'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'transfer_status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6a9c9eb8c0ef49f6aafc9738ace3c200'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'file_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '6e57e0c5adce42c18e9e6088bc9711d3'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '719486506dcd4b7f9863a02757942fa9'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '72e6271020c4462cb8d9880e6f60496c'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'transfer_duration_ms'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '73a6a126c99d4e01a6a2f00835f3e660'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'file_type'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '748c717250e44dfc829b78655daae973'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'file_extension'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7516bbac4fa0480e9c312c4b64275223'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'session_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '75174bdea78945c290da1218e55ab575'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'size_bytes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7901852090ad40099669114e15de8b4c'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'timestamp'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7a643fd4ee504d05a137032d95eb3363'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'file_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '83eeb9a600ca4b14a2004e87286cc7e0'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'transfer_status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '89a5a9739ce0462caa22314f354f928b'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'event_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8bd962a82c0c496fb8cac27eaf29b66d'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'transfer_duration_ms'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '8cff59ebc5bb458c933a5c31c61515be'
                        key: {
                            name: 'x_2064375_synknode_events'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '93917b98954e45cd8932dfdc3ce0d987'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'file_name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9564ea987d60415db8b05a84a9cc7026'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'event_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '97acbb3acdfb4e05b38bfc4b16040b23'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'visit_url'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9f9b86cb13b142c3a9b0f356e69e9783'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'timestamp'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a00a45a62a4c4475a85474b52cb8e7f1'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'size_bytes'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a9d019fecb664512afaf4d577a20358d'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'file_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ab9cb6c1ab8c4c04bf9b3ee22b44ea4e'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'event_type'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'acd8155d7a414ba3991298f255a8949d'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'receiver_id'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b3262cc64f9d4505a7ac2ec390125d3d'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'sender_id'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b333985cae4143f28120b5ba2dfdd351'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'receiver_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b9428751f0a44d0ba002862c4ef5aa7c'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'referrer_url'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bbff785327f748a5aa726f33429951a3'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'timestamp'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'be2077b185ca4a1891165719dedf8924'
                        key: {
                            name: 'x_2064375_synknode_events'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c40cedf8012241dd9af26071d4bfa2a2'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'event_type'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c79db498547549329ce6133ebaf238aa'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'visit_id'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c7a8cd13f10f4b13ab721d6d38eef123'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'visit_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c9e70e66f03a4ffc8c22acc8ff88c919'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'referrer_url'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cc1636ef13c94b3c93efb0fd9dadcd38'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cd8ce4cf9c21458bac80c2a70b389325'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'session_id'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd36de23e4c364331b9149e52ef32adbc'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'app_version'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd5603dcc02c44d6887a29072daa14604'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'referrer_url'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd5cc8322aba944678f1613848dc57303'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'transfer_duration_ms'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'da87f836bba84eceb1a89e4201b3007a'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'dbca3e84bbf543279eded84368e9c1ed'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'visit_url'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'df8926e6818347f7ab948a199cc34052'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'sender_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e2860be428d042cf94988dc8024f597a'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'referrer_url'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e89f55d999a341db9036c71512ed26b7'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'size_bytes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ea199681e96a4c4da684cef5c455db53'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'transfer_status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ed93c5058dd84a0b81a6faa786cbb901'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'sender_id'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'efd00d6613714bbaa369378a5be55ab4'
                        key: {
                            name: 'x_2064375_synknode_events'
                            element: 'file_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f004bc8bd1f443a5b9d247ad3b719729'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'visit_id'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f1bdec5cb3a04273b01f77f516055e4a'
                        deleted: true
                        key: {
                            name: 'x_synknode_events'
                            element: 'visit_url'
                        }
                    },
                ]
            }
        }
    }
}
